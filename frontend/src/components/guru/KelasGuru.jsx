import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function KelasGuru({ students }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  
  // State Pencarian
  const [searchTerm, setSearchTerm] = useState('');

  const currentUserName = localStorage.getItem('name') || 'Guru Pengampu';
  
  // Ambil data assignments guru dari localStorage (disimpan saat login)
  let assignments = [];
  try {
    assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  } catch (e) {
    assignments = [];
  }

  // Kumpulkan daftar kelas unik yang menjadi hak akses guru ini berdasarkan assignments
  const allowedClassesSet = new Set();
  assignments.forEach(a => {
    if (a.classes && Array.isArray(a.classes)) {
      a.classes.forEach(cls => allowedClassesSet.add(cls));
    }
  });
  const allowedClasses = [...allowedClassesSet];

  // Filter siswa hanya pada kelas yang diampu oleh guru tersebut
  const filteredStudentsByAssignment = students.filter(s => allowedClasses.includes(s.class));
  const uniqueClasses = [...new Set(filteredStudentsByAssignment.map(s => s.class))];

  // Filter kelas berdasarkan pencarian
  const filteredClasses = uniqueClasses.filter(cls => 
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter siswa dalam kelas berdasarkan pencarian nama atau kode siswa
  const studentsInClass = filteredStudentsByAssignment.filter(s => s.class === selectedClass);
  const filteredStudents = studentsInClass.filter(s => 
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-2">
        <h2 className="text-sm font-bold text-white">Selamat Datang, {currentUserName}</h2>
        <p className="text-xs text-slate-400">Berikut adalah daftar kelas penugasan mengajar Anda.</p>
      </div>

      {!selectedClass ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white">Daftar Ruang Kelas Binaan Anda</h2>
            <input 
              type="text" 
              placeholder="🔍 Cari nama kelas..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full md:w-72 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setSelectedClass(cls); setSearchTerm(''); }} 
                  className="bg-slate-950/40 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-indigo-500 transition space-y-3 shadow-lg"
                >
                  <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg">🏫</div>
                  <h3 className="text-lg font-bold text-white">Kelas {cls}</h3>
                  <p className="text-xs text-slate-400">{students.filter(s => s.class === cls).length} Siswa Terdaftar</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 text-xs">Tidak ada kelas binaan yang cocok dengan pencarian.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => { setSelectedClass(null); setSearchTerm(''); }} 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
              >
                &larr; Kembali ke Daftar Kelas
              </button>
              <h2 className="text-base font-bold text-white">Kelas: {selectedClass}</h2>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="🔍 Cari nama siswa / kode..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-64 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-indigo-400 font-medium whitespace-nowrap">Total: {filteredStudents.length} Siswa</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                  <th className="p-4">QR Code</th>
                  <th className="p-4">Kode / NIS</th>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Poin Keaktifan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => (
                    <tr key={s._id} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <div 
                          onClick={() => setSelectedQR(s)} 
                          className="bg-white p-1.5 rounded-xl inline-block shadow cursor-pointer hover:scale-105 transition"
                          title="Klik untuk memperbesar QR"
                        >
                          <QRCodeSVG value={s.code} size={38} />
                        </div>
                      </td>
                      <td className="p-4 font-mono text-indigo-400 font-semibold">{s.code}</td>
                      <td className="p-4 text-white font-medium">{s.name}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">
                          {s.points} Poin
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500 text-xs">
                      Tidak ada siswa yang cocok dengan pencarian di kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl text-center space-y-4 max-w-sm w-full">
            <h3 className="text-base font-bold text-white">QR Code Siswa</h3>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG value={selectedQR.code} size={200} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{selectedQR.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Kode: {selectedQR.code}</p>
              <p className="text-xs text-indigo-400 mt-1">Kelas: {selectedQR.class}</p>
            </div>
            <button 
              onClick={() => setSelectedQR(null)} 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}