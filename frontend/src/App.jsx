import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import Shared Components
import Login from './components/shared/Login';
import Navbar from './components/shared/Navbar';

// Import Admin Components
import AdminDashboard from './components/admin/AdminDashboard'; // 👈 1. Import AdminDashboard yang baru
import KelasAdmin from './components/admin/KelasAdmin';
import NilaiAdmin from './components/admin/NilaiAdmin';
import AkunAdmin from './components/admin/AkunAdmin';
import SoalAdmin from './components/admin/SoalAdmin';

// Import Guru Components
import KelasGuru from './components/guru/KelasGuru';
import NilaiGuru from './components/guru/NilaiGuru';
import AkunGuru from './components/guru/AkunGuru';
import SoalGuru from './components/guru/SoalGuru';

// Import Siswa Components
import KelasSiswa from './components/siswa/KelasSiswa';
import NilaiSiswa from './components/siswa/NilaiSiswa';
import AkunSiswa from './components/siswa/AkunSiswa';
import SoalSiswa from './components/siswa/SoalSiswa';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('name') || '');
  
  // 🛠️ 2. Ubah default tab admin/guru ke 'dashboard' agar saat login langsung ke halaman utama analitik
  const [currentTab, setCurrentTab] = useState(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole === 'siswa') return 'nilai';
    if (savedRole === 'admin') return 'dashboard';
    return 'kelas';
  });

  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : `${window.location.origin}/api`; // Otomatis menyesuaikan domain Vercel yang aktif

      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Gagal ambil data siswa:', err);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setRole('');
    setUserName('');
  };

  if (!token) {
    return (
      <Login 
        setToken={(t) => { setToken(t); localStorage.setItem('token', t); }} 
        setRole={(r) => { 
          setRole(r); 
          localStorage.setItem('role', r); 
          setCurrentTab(r === 'siswa' ? 'nilai' : (r === 'admin' ? 'dashboard' : 'kelas'));
        }} 
        setUserName={(n) => { setUserName(n); localStorage.setItem('name', n); }} 
      />
    );
  }

  const userRole = role?.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar 
        role={role} 
        userName={userName} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* ================= ROUTING ADMIN ================= */}
        {userRole === 'admin' && (
          <>
            {currentTab === 'dashboard' && <AdminDashboard students={students} refreshStudents={fetchStudents} />}
            {currentTab === 'kelas' && <KelasAdmin students={students} refreshStudents={fetchStudents} />}
            {currentTab === 'nilai' && <NilaiAdmin students={students} refreshStudents={fetchStudents} />}
            {currentTab === 'soal' && <SoalAdmin />}
            {currentTab === 'akun' && <AkunAdmin />}
          </>
        )}

        {/* ================= ROUTING GURU ================= */}
        {userRole === 'guru' && (
          <>
            {currentTab === 'kelas' && <KelasGuru students={students} />}
            {currentTab === 'nilai' && <NilaiGuru students={students} refreshStudents={fetchStudents} />}
            {currentTab === 'soal' && <SoalGuru />}
            {currentTab === 'akun' && <AkunGuru />}
          </>
        )}

        {/* ================= ROUTING SISWA ================= */}
        {userRole === 'siswa' && (
          <>
            {currentTab === 'kelas' && <KelasSiswa students={students} />}
            {currentTab === 'nilai' && <NilaiSiswa students={students} />}
            {currentTab === 'soal' && <SoalSiswa />}
            {currentTab === 'akun' && <AkunSiswa />}
          </>
        )}
      </main>
    </div>
  );
}