import React from 'react';

export default function AkunGuru() {
  const currentUserName = localStorage.getItem('name') || 'Guru Pengajar';

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Profil Akun Guru</h2>
        <div className="bg-slate-950/40 border border-white/10 p-5 rounded-xl space-y-2 text-xs max-w-md">
          <p><span className="text-slate-400">Nama:</span> <span className="text-white font-medium">{currentUserName}</span></p>
          <p><span className="text-slate-400">Role:</span> <span className="text-indigo-400 capitalize">Guru Pengampu</span></p>
          <p><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-semibold">Aktif (Online)</span></p>
        </div>
      </div>
    </div>
  );
}