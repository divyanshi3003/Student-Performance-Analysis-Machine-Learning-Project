import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import api from '../services/api';
import Layout from '../components/Layout';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Teachers need a list of mentees. Students just have one mentor.
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const messagesEndRef = useRef(null);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    async function loadContacts() {
      try {
        if (isTeacher) {
          const res = await api.get('/students/mentees');
          setContacts(res.data);
        } else {
          // If student, we get their assigned mentor from their profile
          const profileRes = await api.get('/students/me');
          if (profileRes.data.profile?.mentor_id) {
            // We need to fetch the mentor's details. Actually, we can get it from /mentors
            const mentorsRes = await api.get('/mentors');
            const myMentor = mentorsRes.data.find(m => m.id === profileRes.data.profile.mentor_id);
            if (myMentor) {
              setContacts([{ ...myMentor, user_id: myMentor.id }]);
              setSelectedContact({ ...myMentor, user_id: myMentor.id });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load contacts", err);
      }
    }
    
    if (user) loadContacts();
  }, [user, isTeacher]);

  useEffect(() => {
    if (!user || !selectedContact) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.user_id}),and(sender_id.eq.${selectedContact.user_id},receiver_id.eq.${user.id})`)
        .order('sent_at', { ascending: true });
        
      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // If the message is from the currently selected contact
        if (payload.new.sender_id === selectedContact.user_id) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const msgData = {
      sender_id: user.id,
      receiver_id: selectedContact.user_id,
      content: newMessage.trim(),
    };

    // Optimistically add to UI
    setMessages(prev => [...prev, { ...msgData, id: Date.now(), sent_at: new Date().toISOString() }]);
    setNewMessage('');
    scrollToBottom();

    const { error } = await supabase.from('messages').insert([msgData]);
    if (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Layout title="Messages" subtitle={isTeacher ? "Chat with your mentees" : "Chat with your mentor"}>
      <div className="max-w-6xl mx-auto h-[70vh] flex gap-6">
        
        {/* Sidebar / Contacts List */}
        {(isTeacher || contacts.length === 0) && (
          <Card className="w-1/3 h-full flex flex-col">
            <CardContent className="p-0 overflow-y-auto h-full">
              <div className="p-4 border-b font-semibold bg-gray-50 text-gray-700">
                {isTeacher ? "Your Mentees" : "Contacts"}
              </div>
              {contacts.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 text-center">
                  {isTeacher ? "No mentees assigned yet." : "You haven't selected a mentor yet. Go to your dashboard to select one."}
                </div>
              ) : (
                <ul className="divide-y">
                  {contacts.map(c => (
                    <li 
                      key={c.user_id} 
                      onClick={() => setSelectedContact(c)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedContact?.user_id === c.user_id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                    >
                      <div className="font-medium text-gray-900">
                        {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}` : (c.email || 'Student')}
                      </div>
                      {isTeacher && c.department && (
                        <div className="text-xs text-gray-500 mt-1">{c.department} - Sem {c.semester}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Area */}
        <Card className="flex-1 h-full flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b bg-white flex items-center shadow-sm z-10">
                <div className="font-semibold text-gray-800">
                  {selectedContact.first_name || selectedContact.last_name 
                    ? `${selectedContact.first_name} ${selectedContact.last_name}` 
                    : selectedContact.email}
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400 mt-10">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">No messages yet. Say hi!</div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMine 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <span className={`text-[10px] block mt-1 ${isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="rounded-full px-6 bg-primary-600">
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </Card>

      </div>
    </Layout>
  );
}
