import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AkunAdmin from './AkunAdmin';
import KelasAdmin from './KelasAdmin';
import SoalAdmin from './SoalAdmin';

export default function AdminDashboard({ students, refreshStudents }) {
  // Kita gunakan state khusus di dalam dashboard untuk sub-menu atau langsung tampilkan analitik
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [usersCount, setUsersCount] = useState({ guru: 0, siswa: 0, admin: 0 });

  useEffect(() => {
    const fetchUsersStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users');
        const users = res.data;
        const guru = users.filter(u => u.role === 'guru').length;
        const siswa = users.filter(u => u.role === 'siswa').length;
        const admin = users.filter(u => u.role === 'admin').length;
        setUsersCount({ guru, siswa, admin });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsersStats();
  }, [students]);

  const classCounts = students.reduce((acc, s) => {
    const cls = s.class || 'Lainnya';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const tier7 = students.filter(s => String(s.class).includes('7') || String(s.class).toLowerCase().includes('vii')).length;
  const tier8 = students.filter(s => String(s.class).includes('8') || String(s.class).toLowerCase().includes('viii')).length;
  const tier9 = students.filter(s => String(s.class).includes('9') || String(s.class).toLowerCase().includes('ix')).length;
  const totalStudents = students.length || 1; 

  return (
    <div className="space-y-6">
      {/* 🛑 Navbar ganda bagian dalam telah dihapus agar tampilan bersih & profesional */}

      {/* Tampilan Konten Analitik & Grafik (Executive Command Center) */}
      <div className="space-y-6">
        {/* Ringkasan Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center text-indigo-400">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Siswa</span>
              <span className="p-2 bg-indigo-600/20 rounded-xl">👨‍🎓</span>
            </div>
            <h3 className="text-2xl font-black text-white">{students.length} <span className="text-xs font-normal text-slate-400">Jiwa</span></h3>
            <p className="text-[10px] text-emerald-400">● Terdaftar di database aktif</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Guru Pengampu</span>
              <span className="p-2 bg-emerald-600/20 rounded-xl">👩‍🏫</span>
            </div>
            <h3 className="text-2xl font-black text-white">{usersCount.guru} <span className="text-xs font-normal text-slate-400">Pengajar</span></h3>
            <p className="text-[10px] text-emerald-400">● Memiliki hak akses penugasan</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center text-amber-400">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Ruang Kelas</span>
              <span className="p-2 bg-amber-600/20 rounded-xl">🏫</span>
            </div>
            <h3 className="text-2xl font-black text-white">{Object.keys(classCounts).length} <span className="text-xs font-normal text-slate-400">Rombel</span></h3>
            <p className="text-[10px] text-amber-400">● Aktif dalam sistem CBT</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center text-purple-400">
              <span className="text-xs uppercase font-semibold text-slate-400">Admin Sistem</span>
              <span className="p-2 bg-purple-600/20 rounded-xl">🛡️</span>
            </div>
            <h3 className="text-2xl font-black text-white">{usersCount.admin} <span className="text-xs font-normal text-slate-400">Akun</span></h3>
            <p className="text-[10px] text-purple-400">● Kontrol penuh server</p>
          </div>
        </div>

        {/* Visualisasi Grafik Proporsi Tingkat Kelas (7, 8, 9) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Distribusi Populasi Siswa Berdasarkan Tingkat</h3>
                <p className="text-xs text-slate-400">Persentase sebaran jumlah murid di Kelas 7, Kelas 8, dan Kelas 9.</p>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-medium">Real-time Analytics</span>
            </div>

            {/* Progress Bar Grafik Tingkat 7 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Tingkat Kelas 7 (VII)</span>
                <span className="text-indigo-400">{tier7} Siswa ({Math.round((tier7 / totalStudents) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/10">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${(tier7 / totalStudents) * 100}%` }}></div>
              </div>
            </div>

            {/* Progress Bar Grafik Tingkat 8 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Tingkat Kelas 8 (VIII)</span>
                <span className="text-emerald-400">{tier8} Siswa ({Math.round((tier8 / totalStudents) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/10">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${(tier8 / totalStudents) * 100}%` }}></div>
              </div>
            </div>

            {/* Progress Bar Grafik Tingkat 9 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Tingkat Kelas 9 (IX)</span>
                <span className="text-amber-400">{tier9} Siswa ({Math.round((tier9 / totalStudents) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/10">
                <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${(tier9 / totalStudents) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Kolom Samping: Rincian Daftar Rombel Kelas */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">🏫 Rincian Rombel Kelas</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {Object.entries(classCounts).length > 0 ? (
                Object.entries(classCounts).map(([clsName, count], idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-white/5 rounded-xl">
                    <span className="text-xs font-semibold text-slate-200">Kelas {clsName}</span>
                    <span className="text-xs px-2.5 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg font-bold">{count} Siswa</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">Belum ada data rombel kelas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}