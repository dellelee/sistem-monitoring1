import React, { useState } from 'react';
import axios from 'axios';

export default function NilaiGuru({ students, refreshStudents }) {
  let assignments = [];
  try {
    assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  } catch (e) {
    assignments = [];
  }

  // Ambil daftar mapel unik yang diampu oleh guru ini
  const mySubjects = [...new Set(assignments.map(a => a.subject))];
  const [selectedSubject, setSelectedSubject] = useState(mySubjects[0] || 'TIK');

  // Cari kelas apa saja yang diajar untuk mapel yang sedang dipilih
  const currentAssignment = assignments.find(a => a.subject === selectedSubject);
  const allowedClasses = currentAssignment ? currentAssignment.classes : [];

  const [selectedClass, setSelectedClass] = useState(null);
  const [activeSemester, setActiveSemester] = useState('semester1');
  const [activeCategory, setActiveCategory] = useState('individu'); // Pilihan Kategori: individu, kelompok, praktik

  // State Pencarian
  const [searchTerm, setSearchTerm] = useState('');

  const handleGradeChange = async (studentId, semester, meetingKey, categoryKey, val) => {
    try {
      await axios.put(`http://localhost:5000/api/students/grades/${studentId}`, {
        subject: selectedSubject,
        semester,
        meeting: meetingKey,
        category: categoryKey,
        value: val
      });
      refreshStudents();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter kelas binaan berdasarkan pencarian
  const filteredAllowedClasses = allowedClasses.filter(cls => 
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter siswa yang diampu dan sesuai dengan kelas yang dipilih, serta mendukung pencarian nama siswa
  const filteredStudentsByAssignment = students.filter(s => {
    if (!s.class) return false;
    return allowedClasses.some(cls => String(cls).trim().toLowerCase() === String(s.class).trim().toLowerCase());
  });

  const studentsInClass = filteredStudentsByAssignment.filter(s => {
    if (!selectedClass) return false;
    return String(s.class).trim().toLowerCase() === String(selectedClass).trim().toLowerCase();
  });

  const filteredStudents = studentsInClass.filter(s => 
    s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!selectedClass ? (
        <div className="bg-slate-900/65 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-4 gap-4">
            <h2 className="text-base font-bold text-white">Menu Penilaian - Pilih Kelas Binaan</h2>
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="🔍 Cari nama kelas..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-60 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mata Pelajaran:</span>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => { setSelectedSubject(e.target.value); setSelectedClass(null); setSearchTerm(''); }} 
                  className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
                >
                  {mySubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAllowedClasses.length > 0 ? (
              filteredAllowedClasses.map((cls, idx) => (
                <div key={idx} onClick={() => { setSelectedClass(cls); setSearchTerm(''); }} className="bg-slate-950/40 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-emerald-500 transition space-y-3 shadow">
                  <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">📊</div>
                  <h3 className="text-lg font-bold text-white">Kelas {cls}</h3>
                  <p className="text-xs text-slate-400">
                    {students.filter(s => s.class && String(s.class).trim().toLowerCase() === String(cls).trim().toLowerCase()).length} Siswa
                  </p>
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
              <button onClick={() => { setSelectedClass(null); setSearchTerm(''); }} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl">&larr; Kembali</button>
              <h2 className="text-base font-bold text-white">Penilaian {selectedSubject} - Kelas: {selectedClass}</h2>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Kolom Pencarian Nama Siswa */}
              <input 
                type="text" 
                placeholder="🔍 Cari nama siswa..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-52 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />

              {/* Pilihan Kategori Nilai */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveCategory('individu')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === 'individu' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Individu
                </button>
                <button 
                  onClick={() => setActiveCategory('kelompok')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === 'kelompok' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Kelompok
                </button>
                <button 
                  onClick={() => setActiveCategory('praktik')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === 'praktik' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  Praktik
                </button>
              </div>

              {/* Pilihan Semester */}
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

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl overflow-x-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Sedang Menginput Kategori: <span className="text-emerald-400 uppercase font-bold">{activeCategory}</span> ({activeSemester === 'semester1' ? 'Semester 1' : 'Semester 2'})
              </span>
            </div>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                  <th className="p-3 min-w-[180px]">Nama Siswa</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <th key={p} className="p-2 text-center w-14">P{p}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => {
                    const subjGrades = s.grades?.[selectedSubject] || {};
                    const semGrades = subjGrades[activeSemester] || {};
                    
                    return (
                      <tr key={s._id} className="hover:bg-white/5">
                        <td className="p-3 text-white font-medium">{s.name}</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                          const meetingData = semGrades[`p${p}`];
                          let currentValue = 0;
                          if (typeof meetingData === 'object' && meetingData !== null) {
                            currentValue = meetingData[activeCategory] !== undefined ? meetingData[activeCategory] : 0;
                          } else if (typeof meetingData === 'number') {
                            currentValue = meetingData;
                          }

                          return (
                            <td key={p} className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentValue}
                                onChange={(e) => handleGradeChange(s._id, activeSemester, `p${p}`, activeCategory, e.target.value)}
                                className="w-14 text-center px-1 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-500 text-xs">
                      Tidak ada siswa yang cocok dengan pencarian di kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}