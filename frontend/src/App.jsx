import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Predict from './pages/Predict';
import Insights from './pages/Insights';
import History from './pages/History';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <>
      <Toaster position="top-right" />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'predict' && <Predict />}
        {activeTab === 'insights' && <Insights />}
        {activeTab === 'history' && <History />}
      </Layout>
    </>
  );
}

export default App;
