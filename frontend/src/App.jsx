import React, { useState } from 'react';
import Layout from './components/Layout';
import Predict from './pages/Predict';
import Insights from './pages/Insights';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'predict' ? <Predict /> : <Insights />}
    </Layout>
  );
}

export default App;
