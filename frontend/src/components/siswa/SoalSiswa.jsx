import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function SoalSiswa() {
  const [subject, setSubject] = useState('TIK');
  const [examList, setExamList] = useState([]); 
  const [selectedExam, setSelectedExam] = useState(null); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  
  const violationCountRef = useRef(0);
  const selectedExamRef = useRef(null);
  const answersRef = useRef({});
  const isSubmittedRef = useRef(false);

  selectedExamRef.current = selectedExam;
  answersRef.current = answers;
  isSubmittedRef.current = isSubmitted;

  const subjectsList = ['TIK', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'];
  const studentName = localStorage.getItem('name') || '';

  const handleSubmitExamAutomatically = async () => {
    if (!selectedExamRef.current || isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    try {
      const res = await axios.post('http://localhost:5000/api/soal/submit', {
        studentName,
        examId: selectedExamRef.current._id,
        answers: answersRef.current,
        semester: selectedExamRef.current.semester,
        meetingKey: `p${selectedExamRef.current.meeting || 1}`,
        category: selectedExamRef.current.category
      });
      setScore(res.data.finalGrade);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Auto submit error:', err);
    }
  };

  // 🛡️ FITUR ANTI-KECURANGAN KETAT (Tab lain, Minimize, Split-Screen / Pindah Jendela Lain, & Blokir Klik Navbar)
  useEffect(() => {
    if (!selectedExam) return;

    const handleViolation = () => {
      if (!selectedExamRef.current || isSubmittedRef.current) return;
      
      violationCountRef.current += 1;
      
      if (violationCountRef.current >= 3) {
        handleSubmitExamAutomatically();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    // Deteksi jika jendela kehilangan fokus (misal mengklik jendela sebelah / split-screen / taskbar)
    const handleWindowBlur = () => {
      handleViolation();
    };

    // Fungsi untuk memblokir klik pada tombol menu navbar utama secara diam-diam tanpa alert
    const handleNavbarClick = (e) => {
      const clickedButton = e.target.closest('button') || e.target.closest('a');
      if (clickedButton) {
        const text = clickedButton.innerText.toLowerCase();
        if (text.includes('akun') || text.includes('penilaian') || text.includes('soal') || text.includes('logout')) {
          e.preventDefault();
          e.stopPropagation();
          handleViolation();
        }
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleNavbarClick, true);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleNavbarClick, true);
    };
  }, [selectedExam]);
  
  // Ambil semua daftar ujian dari backend berdasarkan mapel
  const fetchExamsForStudent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/soal');
      const allExams = res.data;
      
      const matchedExams = allExams.filter(e => 
        e.subject && e.subject.trim().toLowerCase() === subject.trim().toLowerCase()
      );

      setExamList(matchedExams);
      setSelectedExam(null); 
      setCurrentIndex(0);
      setAnswers({});
      setIsSubmitted(false);
      setScore(null);
      violationCountRef.current = 0;
    } catch (err) {
      console.error('Gagal mengambil daftar ujian:', err);
    }
  };

  useEffect(() => {
    fetchExamsForStudent();
  }, [subject]);

  const handleAnswerChange = (qIndex, optionValue, questionType) => {
    if (questionType === 'checkbox') {
      const currentSelected = answers[qIndex] || [];
      let updated;
      if (currentSelected.includes(optionValue)) {
        updated = currentSelected.filter(item => item !== optionValue);
      } else {
        updated = [...currentSelected, optionValue];
      }
      setAnswers({ ...answers, [qIndex]: updated });
    } else {
      setAnswers({ ...answers, [qIndex]: optionValue });
    }
  };

  const handleSubmitExam = async () => {
    if (!selectedExam) return;
    isSubmittedRef.current = true;
    try {
      const res = await axios.post('http://localhost:5000/api/soal/submit', {
        studentName,
        examId: selectedExam._id,
        answers,
        semester: selectedExam.semester,
        meetingKey: `p${selectedExam.meeting || 1}`,
        category: selectedExam.category
      });
      setScore(res.data.finalGrade);
      setIsSubmitted(true);
      alert('Ujian berhasil dikirim dan dinilai!');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim ujian.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {!selectedExam && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white">Ujian & Tugas Berbasis Komputer (CBT)</h2>
            <p className="text-xs text-slate-400">Pilih Mata Pelajaran untuk melihat daftar tugas</p>
          </div>
          <select 
            value={subject} 
            onChange={(e) => {
              setSubject(e.target.value);
              setSelectedExam(null);
            }} 
            className="bg-slate-950 border border-white/10 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
          >
            {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {!selectedExam ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Daftar Tugas / Ujian Tersedia ({subject})</h3>
          <div className="grid grid-cols-1 gap-4">
            {examList.length > 0 ? (
              examList.map((exam) => {
                const isAlreadyDone = exam.submittedStudents && exam.submittedStudents.includes(studentName);
                return (
                  <div key={exam._id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex justify-between items-center shadow-lg">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2.5 py-0.5 rounded-full font-semibold">Pertemuan {exam.meeting || 1}</span>
                        <span className="text-[10px] bg-purple-600/30 text-purple-400 px-2.5 py-0.5 rounded-full uppercase">{exam.category || 'individu'}</span>
                        <span className="text-[10px] bg-sky-600/30 text-sky-400 px-2.5 py-0.5 rounded-full">{exam.semester === 'semester2' ? 'Semester 2' : 'Semester 1'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{exam.title}</h4>
                      <p className="text-xs text-slate-400">Jumlah Soal: {exam.questions?.length || 0} butir • Guru: {exam.teacherName || 'Admin'}</p>
                    </div>

                    <div>
                      {isAlreadyDone ? (
                        <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl">
                          Sudah Dikerjakan ✔
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const randomizedQuestions = [...exam.questions].sort(() => Math.random() - 0.5);
                            setSelectedExam({ ...exam, questions: randomizedQuestions });
                            setCurrentIndex(0);
                            setAnswers({});
                            setIsSubmitted(false);
                            setScore(null);
                            violationCountRef.current = 0;
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                        >
                          Kerjakan Ujian &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-12 rounded-2xl shadow-xl text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mx-auto font-bold">📂</div>
                <h4 className="text-sm font-bold text-white">Belum Ada Tugas Aktif</h4>
                <p className="text-xs text-slate-400">Belum ada paket soal atau tugas untuk mata pelajaran {subject}.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedExam.title}</h3>
              <p className="text-xs text-slate-400">Pertemuan {selectedExam.meeting || 1} • {selectedExam.subject}</p>
            </div>
          </div>

          {!isSubmitted ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-indigo-400">Soal {currentIndex + 1} dari {selectedExam.questions.length} (Soal Diacak)</span>
                <span className="text-xs text-slate-400">Tipe: <span className="uppercase font-semibold text-amber-400">{selectedExam.questions[currentIndex].questionType || 'radio'}</span></span>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-white leading-relaxed">{selectedExam.questions[currentIndex].questionText || selectedExam.questions[currentIndex].question}</p>
                
                {selectedExam.questions[currentIndex].image && (
                  <div className="py-2 flex justify-center">
                    <img src={selectedExam.questions[currentIndex].image} alt="Ilustrasi Soal Ujian" className="max-h-60 rounded-xl border border-white/10 object-contain" />
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  {selectedExam.questions[currentIndex].questionType === 'essay' ? (
                    <div>
                      <textarea
                        rows="4"
                        placeholder="Tuliskan jawaban uraian Anda di sini..."
                        value={answers[currentIndex] || ''}
                        onChange={(e) => handleAnswerChange(currentIndex, e.target.value, 'essay')}
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    selectedExam.questions[currentIndex].options.map((opt, idx) => {
                      const isCheckbox = selectedExam.questions[currentIndex].questionType === 'checkbox';
                      const selectedArr = answers[currentIndex] || [];
                      const isSelected = isCheckbox ? selectedArr.includes(opt) : answers[currentIndex] === opt;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerChange(currentIndex, opt, selectedExam.questions[currentIndex].questionType)}
                          className={`w-full text-left p-4 rounded-xl text-xs transition border flex items-center space-x-3 ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold' : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-white/5'}`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-slate-800 disabled:opacity-40 text-slate-300 text-xs rounded-xl transition"
                >
                  &larr; Sebelumnya
                </button>

                {currentIndex < selectedExam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(prev + 1, selectedExam.questions.length - 1))}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition"
                  >
                    Selanjutnya &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm('Selesaikan ujian dan kirim jawaban?')) {
                        handleSubmitExam();
                      }
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    Selesaikan Ujian
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto font-bold">🏆</div>
              <h3 className="text-lg font-bold text-white">Ujian Telah Selesai!</h3>
              <p className="text-xs text-slate-400">Hasil evaluasi tugas {selectedExam.title}</p>
              <div className="text-3xl font-black text-emerald-400 py-2">Nilai Anda: {score}</div>
              <button
                onClick={() => {
                  setSelectedExam(null);
                  fetchExamsForStudent();
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition"
              >
                Kembali ke Daftar Tugas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}