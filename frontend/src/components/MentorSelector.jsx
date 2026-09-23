import { useState, useEffect } from 'react';
import api from '../services/api';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';

export default function MentorSelector() {
  const [mentors, setMentors] = useState([]);
  const [currentMentorId, setCurrentMentorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [mentorsRes, profileRes] = await Promise.all([
          api.get('/mentors'),
          api.get('/students/me')
        ]);
        
        setMentors(mentorsRes.data);
        if (profileRes.data.profile && profileRes.data.profile.mentor_id) {
          setCurrentMentorId(profileRes.data.profile.mentor_id);
        }
      } catch (err) {
        console.error("Failed to load mentors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.put('/mentors/me', { mentor_id: currentMentorId });
      setSuccessMsg("Mentor assigned successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to assign mentor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="mb-6 border border-primary-100 bg-primary-50">
      <CardContent className="py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-900">Your Mentor</h3>
          <p className="text-sm text-primary-700">Select a teacher to share your progress with.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={currentMentorId}
            onChange={(e) => setCurrentMentorId(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 pl-3 pr-10"
          >
            <option value="" disabled>Select a Mentor</option>
            {mentors.map(m => (
              <option key={m.id} value={m.id}>
                {m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.email}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleSave} 
            disabled={saving || !currentMentorId}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
      {(error || successMsg) && (
        <div className={`px-6 pb-4 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
          {error || successMsg}
        </div>
      )}
    </Card>
  );
}
