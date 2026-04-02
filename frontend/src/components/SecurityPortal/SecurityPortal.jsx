import React, { useState } from 'react';
import StaffRegister from './StaffRegister';
import QRScanner from './QRScanner';

const SecurityPortal = () => {
  const [activeTab, setActiveTab] = useState('staff');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-blue-50 to-slate-100">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#003366] via-[#0052a3] to-[#004085] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-lg rounded-3xl flex items-center justify-center text-5xl shadow-lg border border-white/20">
              🔐
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight">Security Portal</h1>
              <p className="text-blue-100 text-lg mt-2 font-medium">Enterprise Campus Access Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-6 px-8 font-bold text-lg transition-all duration-300 border-b-4 rounded-t-lg ${
                activeTab === 'staff'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-blue-600'
              }`}
            >
              👥 Staff Management
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`py-6 px-8 font-bold text-lg transition-all duration-300 border-b-4 rounded-t-lg ${
                activeTab === 'scanner'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-transparent'
                  : 'border-transparent text-slate-600 hover:text-blue-600'
              }`}
            >
              📱 QR Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'staff' && <StaffRegister />}
        {activeTab === 'scanner' && <QRScanner />}
      </div>
    </div>
  );
};

export default SecurityPortal;
