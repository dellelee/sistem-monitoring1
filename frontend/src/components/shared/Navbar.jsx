import React, { useState } from 'react';

export default function Navbar({ role, userName, currentTab, setCurrentTab, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  // Menyesuaikan daftar menu secara spesifik berdasarkan Role
  let menuItems = [];

  const userRole = role?.toLowerCase();

  if (userRole === 'admin') {
    menuItems = [
      { id: 'dashboard', label: '🏠 Dashboard' },
      { id: 'kelas', label: '🏫 Kelas' },
      { id: 'nilai', label: '📊 Nilai Siswa' },
      { id: 'soal', label: '📝 Pembuatan Soal' },
      { id: 'akun', label: '👤 Akun' }
    ];
  } else if (userRole === 'guru') {
    menuItems = [
      { id: 'kelas', label: '🏫 Kelas & Siswa' },
      { id: 'nilai', label: '📊 Nilai Siswa' },
      { id: 'soal', label: '📝 Pembuatan Soal' },
      { id: 'akun', label: '👤 Akun' }
    ];
  } else if (userRole === 'siswa') {
    menuItems = [
      { id: 'nilai', label: '📊 Penilaian Saya' },
      { id: 'soal', label: '📝 Soal Ujian' },
      { id: 'akun', label: '👤 Akun' }
    ];
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo / Judul Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            MS
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Monitoring Siswa</h1>
            <p className="text-[10px] text-slate-400 capitalize">Role: <span className="text-indigo-400 font-medium">{role}</span></p>
          </div>
        </div>

        {/* Menu Navigasi Desktop */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                currentTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Informasi User & Tombol Logout (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs font-medium text-white">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Online</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition"
          >
            Logout
          </button>
        </div>

        {/* Tombol Hamburger Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-950/40 border border-white/10"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {isOpen && (
        <div className="md:hidden px-6 py-4 bg-slate-900/95 border-b border-white/10 space-y-3">
          <div className="border-b border-white/10 pb-3">
            <p className="text-xs font-medium text-white">Login: {userName}</p>
            <p className="text-[10px] text-indigo-400 capitalize">Role: {role}</p>
          </div>
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentTab(item.id); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition ${
                  currentTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center transition mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}