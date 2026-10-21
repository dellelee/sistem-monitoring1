import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function SiswaDashboard({ userName }) {
  const [activeTab, setActiveTab] = useState('nilai');
  const [studentData, setStudentData] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [activeSoal, setActiveSoal] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [selectedSemester, setSelectedSemester] = useState('semester1');
  const [selectedSubject, setSelectedSubject] = useState('TIK');
  const [selectedCategory, setSelectedCategory] = useState('individu'); // 👈 Ditambahkan pilihan kategori nilai

  const subjects = ['TIK', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'];

  const fetchData = async () => {
    try {
      const [studentRes, soalRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students'),
        axios.get('http://localhost:5000/api/soal')
      ]);
      const myData = studentRes.data.find(s => s.name === userName);
      if (myData) setStudentData(myData);
      setSoalList(soalRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userName]);

  const handleSubmitExam = async () => {
    if (!window.confirm('Kirim jawaban ujian? Nilai akan otomatis masuk ke rekap nilai Anda.')) return;
    try {
      const res = await axios.post('http://localhost:5000/api/soal/submit', {
        studentName: userName,
        examId: activeSoal._id,
        answers: studentAnswers
      });
      alert(`✅ Ujian selesai! Nilai Anda: ${res.data.finalGrade}`);
      setActiveSoal(null);
      fetchData(); // Refresh data siswa agar nilai langsung muncul di tabel
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirimkan ujian.');
    }
  };

  // Helper untuk membaca nilai berdasarkan kategori (individu, kelompok, praktik) atau angka lama
  const getGradeValue = (meetingKey) => {
    const grades = studentData?.grades?.[selectedSubject]?.[selectedSemester] || {};
    const meetingData = grades[meetingKey];
    if (meetingData === undefined || meetingData === null) return 0;

    if (typeof meetingData === 'object') {
      return meetingData[selectedCategory] !== undefined ? meetingData[selectedCategory] : 0;
    }
    return Number(meetingData) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 w-fit">
        <button onClick={() => setActiveTab('nilai')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'nilai' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📊 Nilai Saya</button>
        <button onClick={() => setActiveTab('soal')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'soal' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📝 Kerjakan Ujian</button>
        <button onClick={() => setActiveTab('profil')} className={`px-5 py-2 rounded-xl text-xs font-medium transition ${activeTab === 'profil' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>👤 Kartu & Profil</button>
      </div>

      {activeTab === 'nilai' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-4 gap-4">
            <h2 className="text-base font-bold text-white">Rekap Nilai Akademik: {userName}</h2>
            <div className="flex flex-wrap gap-2">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl capitalize">
                <option value="individu">Kategori: Individu</option>
                <option value="kelompok">Kategori: Kelompok</option>
                <option value="praktik">Kategori: Praktik</option>
              </select>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl">
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl">
                <option value="semester1">Semester 1</option>
                <option value="semester2">Semester 2</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <th key={p} className="p-3 text-center">Pertemuan {p}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                    const gradeVal = getGradeValue(`p${p}`);
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
      )}

      {activeTab === 'soal' && !activeSoal && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-white/10 pb-4">Daftar Ujian Tersedia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soalList.map(item => {
              const isSubmitted = item.submittedStudents && item.submittedStudents.includes(userName);
              return (
                <div key={item._id} className="bg-slate-950/50 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="flex gap-1.5 mb-1">
                      <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full">{item.subject}</span>
                      <span className="text-[10px] bg-purple-600/30 text-purple-400 px-2 py-0.5 rounded-full capitalize">{item.category || 'individu'}</span>
                      <span className="text-[10px] bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded-full">P-{item.meeting || 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <div>
                    {isSubmitted ? (
                      <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium">✓ Selesai</span>
                    ) : (
                      <button onClick={() => { setActiveSoal(item); setCurrentIndex(0); setStudentAnswers({}); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl transition">Kerjakan</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'soal' && activeSoal && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white">{activeSoal.title}</h2>
            <button onClick={() => setActiveSoal(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl">&larr; Keluar</button>
          </div>
          {activeSoal.questions[currentIndex] && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/10">
                <p className="text-sm text-white font-medium">{activeSoal.questions[currentIndex].questionText}</p>
              </div>
              {activeSoal.questions[currentIndex].questionType === 'essay' ? (
                <textarea rows="4" placeholder="Ketik jawaban..." value={studentAnswers[currentIndex] || ''} onChange={(e) => setStudentAnswers({ ...studentAnswers, [currentIndex]: e.target.value })} className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl text-xs text-white" />
              ) : (
                <div className="space-y-2">
                  {activeSoal.questions[currentIndex].options.map((opt, idx) => {
                    const isChecked = activeSoal.questions[currentIndex].questionType === 'checkbox'
                      ? (Array.isArray(studentAnswers[currentIndex]) && studentAnswers[currentIndex].includes(opt))
                      : (studentAnswers[currentIndex] === opt);

                    return (
                      <label key={idx} className="flex items-center space-x-3 p-3.5 bg-slate-950/40 border border-white/10 rounded-xl cursor-pointer">
                        <input 
                          type={activeSoal.questions[currentIndex].questionType === 'checkbox' ? 'checkbox' : 'radio'} 
                          name={`q-${currentIndex}`} 
                          checked={isChecked} 
                          onChange={() => {
                            if (activeSoal.questions[currentIndex].questionType === 'checkbox') {
                              const curr = studentAnswers[currentIndex] || [];
                              const updated = curr.includes(opt) ? curr.filter(o => o !== opt) : [...curr, opt];
                              setStudentAnswers({ ...studentAnswers, [currentIndex]: updated });
                            } else {
                              setStudentAnswers({ ...studentAnswers, [currentIndex]: opt });
                            }
                          }} 
                        />
                        <span className="text-xs text-slate-200">{String.fromCharCode(65 + idx)}. {opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} className="px-4 py-2 bg-slate-800 text-white text-xs rounded-xl">Sebelumnya</button>
            {currentIndex < activeSoal.questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(currentIndex + 1)} className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl">Selanjutnya</button>
            ) : (
              <button onClick={handleSubmitExam} className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">Kirim Ujian ✓</button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profil' && studentData && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4">
          <h2 className="text-base font-bold text-white">Kartu Identitas Siswa</h2>
          <div className="bg-white p-4 rounded-2xl shadow-inner"><QRCodeSVG value={studentData.code} size={160} /></div>
          <div className="text-center">
            <p className="text-white font-bold">{studentData.name}</p>
            <p className="text-xs text-slate-400">Kelas: {studentData.class} | Kode: {studentData.code}</p>
          </div>
        </div>
      )}
    </div>
  );
}