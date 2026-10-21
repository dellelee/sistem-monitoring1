import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SoalAdmin() {
  const [soalList, setSoalList] = useState([]);
  const [students, setStudents] = useState([]);
  const [title, setTitle] = useState('');
  const [uploadType, setUploadType] = useState('manual'); // 'manual' atau 'excel'
  const [excelFile, setExcelFile] = useState(null);
  
  const subjects = ['TIK', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'];
  const [subject, setSubject] = useState('TIK');

  const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [semester, setSemester] = useState('semester1');
  const [meeting, setMeeting] = useState(1);
  const [category, setCategory] = useState('individu');

  // State pertanyaan manual lengkap dengan dukungan gambar dan berbagai tipe soal
  const [questions, setQuestions] = useState([
    { questionText: '', image: '', questionType: 'radio', options: ['', '', '', ''], correctAnswer: '', points: 10 }
  ]);

  const fetchData = async () => {
    try {
      const [soalRes, studentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/soal'),
        axios.get('http://localhost:5000/api/students')
      ]);
      setSoalList(soalRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (uniqueClasses.length > 0 && selectedClasses.length === 0) {
      setSelectedClasses(uniqueClasses);
    }
  }, [students]);

  const handleCheckboxChange = (className) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === uniqueClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses([...uniqueClasses]);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions, 
      { questionText: '', image: '', questionType: 'radio', options: ['', '', '', ''], correctAnswer: '', points: 10 }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      alert('Minimal harus ada 1 pertanyaan.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  // Submit Manual
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      alert('Pilih minimal satu kelas target!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/soal/manual', {
        title,
        subject,
        targetClasses: selectedClasses,
        semester,
        meeting: Number(meeting),
        category,
        teacherName: 'Administrator',
        questions
      });
      alert('Paket soal manual beserta gambar berhasil disimpan!');
      setTitle('');
      setMeeting(1);
      setCategory('individu');
      setQuestions([{ questionText: '', image: '', questionType: 'radio', options: ['', '', '', ''], correctAnswer: '', points: 10 }]);
      fetchData();
    } catch (err) {
      alert('Gagal menyimpan soal.');
    }
  };

  // Submit Upload Excel
  const handleSubmitExcel = async (e) => {
    e.preventDefault();
    if (!excelFile || selectedClasses.length === 0) {
      alert('Pilih file Excel dan minimal satu kelas target!');
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('title', title || 'Ujian Excel Admin');
    formData.append('subject', subject);
    formData.append('targetClasses', JSON.stringify(selectedClasses));
    formData.append('semester', semester);
    formData.append('meeting', meeting);
    formData.append('category', category);
    formData.append('teacherName', 'Administrator');

    try {
      await axios.post('http://localhost:5000/api/soal/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Soal berhasil diunggah dari Excel dan disebar ke kelas terpilih!');
      setTitle('');
      setExcelFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengunggah file Excel.');
    }
  };

  const handleDeleteSoal = async (id) => {
    if (window.confirm('Hapus paket soal ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/soal/${id}`);
        fetchData();
      } catch (err) {
        alert('Gagal menghapus soal.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Buat / Upload Soal */}
      <div className="bg-slate-900/65 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white">📝 Buat / Upload Paket Soal (Admin & Guru)</h2>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button 
              type="button" 
              onClick={() => setUploadType('manual')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${uploadType === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Input Manual
            </button>
            <button 
              type="button" 
              onClick={() => setUploadType('excel')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${uploadType === 'excel' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Upload Excel
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Judul Ujian</label>
              <input 
                type="text" 
                placeholder="Contoh: Ujian TIK Bab 1" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategori Penilaian</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                required
              >
                <option value="individu">Individu (Teori/Kuis)</option>
                <option value="kelompok">Kelompok (Diskusi)</option>
                <option value="praktik">Praktik (Unjuk Kerja)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Mata Pelajaran</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                required
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Semester</label>
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                required
              >
                <option value="semester1">Semester 1</option>
                <option value="semester2">Semester 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pertemuan Ke-</label>
              <select 
                value={meeting} 
                onChange={(e) => setMeeting(e.target.value)} 
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(m => (
                  <option key={m} value={m}>Pertemuan {m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pilihan Kelas Target */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Target Kelas Ujian</label>
              <button 
                type="button" 
                onClick={handleSelectAllClasses}
                className="text-[10px] text-indigo-400 hover:underline font-medium"
              >
                {selectedClasses.length === uniqueClasses.length ? 'Batalkan Semua' : 'Pilih Semua Kelas'}
              </button>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {uniqueClasses.length > 0 ? (
                uniqueClasses.map(cls => (
                  <label key={cls} className="flex items-center space-x-2 cursor-pointer bg-slate-900 px-3 py-2 rounded-xl border border-white/5 hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={selectedClasses.includes(cls)} 
                      onChange={() => handleCheckboxChange(cls)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                    />
                    <span className="text-xs text-white font-medium">Kelas {cls}</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-slate-500">Belum ada data kelas tersedia di sistem.</span>
              )}
            </div>
          </div>

          {/* FORM UPLOAD EXCEL */}
          {uploadType === 'excel' ? (
            <form onSubmit={handleSubmitExcel} className="space-y-4 pt-2">
              <div className="bg-slate-950/80 p-6 rounded-xl border border-dashed border-indigo-500/40 text-center space-y-3">
                <div className="text-xs text-slate-300 font-medium">Upload File Excel Soal (.xlsx / .xls)</div>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer mx-auto block"
                  required
                />
                <p className="text-[10px] text-slate-500">Kolom Excel: soal, image (opsional), tipe (radio/checkbox/essay), A, B, C, D, E, kunci, bobot.</p>
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
              >
                Unggah & Proses File Excel
              </button>
            </form>
          ) : (
            /* FORM MANUAL DENGAN DUKUNGAN GAMBAR & TIPE SOAL */
            <form onSubmit={handleSubmitManual} className="space-y-4 pt-2">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Daftar Pertanyaan Manual</h3>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-semibold">Soal Nomor #{qIdx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion(qIdx)} 
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Hapus Soal Ini
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-slate-400 mb-1">Pertanyaan / Teks Soal</label>
                        <input 
                          type="text" 
                          placeholder="Tulis pertanyaan di sini..." 
                          value={q.questionText} 
                          onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)} 
                          className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Tipe Soal</label>
                        <select 
                          value={q.questionType} 
                          onChange={(e) => handleQuestionChange(qIdx, 'questionType', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                        >
                          <option value="radio">Radio (Pilihan Ganda)</option>
                          <option value="checkbox">Checkbox (Pilihan Ganda Kompleks)</option>
                          <option value="essay">Essay (Uraian)</option>
                        </select>
                      </div>
                    </div>

                    {/* Input Gambar Soal Opsional */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">URL Gambar Soal (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="https://contoh.com/gambar.png" 
                        value={q.image} 
                        onChange={(e) => handleQuestionChange(qIdx, 'image', e.target.value)} 
                        className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                      />
                    </div>

                    {q.questionType !== 'essay' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <input 
                            key={oIdx} 
                            type="text" 
                            placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`} 
                            value={opt} 
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} 
                            className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                            required 
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder={q.questionType === 'checkbox' ? "Kunci Jawaban (Contoh: A, C)" : "Kunci Jawaban (Contoh: A atau teks essay)"} 
                        value={q.correctAnswer} 
                        onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)} 
                        className="px-4 py-1.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 focus:outline-none" 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Poin Soal" 
                        value={q.points} 
                        onChange={(e) => handleQuestionChange(qIdx, 'points', e.target.value)} 
                        className="px-4 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                        required 
                      />
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handleAddQuestion} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
                >
                  + Tambah Pertanyaan Lain
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition shadow-lg shadow-indigo-500/20"
              >
                Simpan & Publikasikan Soal
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Daftar Soal Terpublikasi */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-4">📋 Daftar Seluruh Paket Soal Terpublikasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soalList.length > 0 ? (
            soalList.map(item => (
              <div key={item._id} className="bg-slate-950/50 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full">{item.subject}</span>
                    <span className="text-[10px] bg-purple-600/30 text-purple-400 px-2 py-0.5 rounded-full capitalize">{item.category || 'individu'}</span>
                    <span className="text-[10px] bg-amber-600/30 text-amber-400 px-2 py-0.5 rounded-full">
                      Kelas: {item.targetClasses ? item.targetClasses.join(', ') : '-'}
                    </span>
                    <span className="text-[10px] bg-sky-600/30 text-sky-400 px-2 py-0.5 rounded-full">{item.semester === 'semester2' ? 'Semester 2' : 'Semester 1'}</span>
                    <span className="text-[10px] bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded-full">Pertemuan {item.meeting || 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.questions?.length || 0} Soal • Oleh: {item.teacherName || 'Admin'}</p>
                </div>
                <button 
                  onClick={() => handleDeleteSoal(item._id)} 
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded-xl transition"
                >
                  Hapus
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
              Belum ada paket soal di dalam sistem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}