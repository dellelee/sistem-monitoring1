import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KelasView from '../KelasView';
import SoalView from '../SoalView';
import NilaiView from '../NilaiView_4';

export default function GuruDashboard({ students, refreshStudents }) {
  const [activeTab, setActiveTab] = useState('kelas');

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 w-fit">
        <button onClick={() => setActiveTab('kelas')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'kelas' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>🏫 Manajemen Kelas</button>
        <button onClick={() => setActiveTab('soal')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'soal' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📝 Unggah & Kelola Soal</button>
        <button onClick={() => setActiveTab('nilai')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'nilai' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📊 Input & Rekap Nilai</button>
      </div>

      {activeTab === 'kelas' && <KelasView students={students} role="guru" refreshStudents={refreshStudents} />}
      {activeTab === 'soal' && <SoalView role="guru" />}
      {activeTab === 'nilai' && <NilaiView students={students} role="guru" refreshStudents={refreshStudents} />}
    </div>
  );
}