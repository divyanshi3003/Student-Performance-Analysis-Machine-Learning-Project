import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
