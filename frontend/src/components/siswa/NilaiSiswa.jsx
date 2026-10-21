import React, { useState } from 'react';

export default function NilaiSiswa({ students }) {
  const [selectedSubject, setSelectedSubject] = useState('TIK');
  const [activeSemester, setActiveSemester] = useState('semester1');
  const [selectedCategory, setSelectedCategory] = useState('individu'); // Pilihan kategori untuk dilihat rekapnya
  const currentUserName = localStorage.getItem('name');

  const subjects = ['TIK', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'];

  const myData = students.find(s => s.name === currentUserName);
  const subjGrades = myData?.grades?.[selectedSubject] || {};
  const grades = subjGrades[activeSemester] || {};

  // Fungsi helper untuk mengambil nilai berdasarkan kategori dari struktur objek atau angka lama
  const getGradeValue = (meetingKey, category) => {
    const meetingData = grades[meetingKey];
    if (meetingData === undefined || meetingData === null) return 0;

    // Jika formatnya sudah berupa objek kategori (individu, kelompok, praktik)
    if (typeof meetingData === 'object') {
      return meetingData[category] !== undefined ? meetingData[category] : 0;
    }
    
    // Fallback jika datanya masih berupa angka tunggal format lama
    return Number(meetingData) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-4 gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Rekap Nilai Akademik: {currentUserName}</h2>
            <p className="text-xs text-slate-400">Kelas: {myData?.class || '-'}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter Kategori */}
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none capitalize"
            >
              <option value="individu">Kategori: Individu</option>
              <option value="kelompok">Kategori: Kelompok</option>
              <option value="praktik">Kategori: Praktik</option>
            </select>

            {/* Filter Mapel */}
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)} 
              className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Filter Semester */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setActiveSemester('semester1')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSemester === 'semester1' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Semester 1
              </button>
              <button 
                onClick={() => setActiveSemester('semester2')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSemester === 'semester2' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Semester 2
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <th key={p} className="p-3 text-center">Pertemuan {p}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                  const gradeVal = getGradeValue(`p${p}`, selectedCategory);
                  return (
                    <td key={p} className="p-4 text-center font-bold text-emerald-400 text-base">
                      {gradeVal}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}