import React from 'react';
import { BookOpen, BarChart2, LayoutDashboard } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2 text-indigo-600">
              <BookOpen className="h-8 w-8" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                EduMetrics ML
              </span>
            </div>
            <div className="ml-6 flex space-x-4">
              <button
                onClick={() => setActiveTab('predict')}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'predict'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Prediction Form
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'insights'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
