import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';

export default function KelasAdmin({ students, refreshStudents }) {
  const [name, setName] = useState('');
  const [classNameInput, setClassNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [points, setPoints] = useState(100);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  
  // State Pencarian
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Edit Siswa
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPoints, setEditPoints] = useState(100);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const targetClass = selectedClass || classNameInput;
    if (!targetClass) {
      alert('Nama kelas harus diisi!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/students', {
        name,
        class: targetClass,
        password,
        points: Number(points) || 100
      });

      setName('');
      setClassNameInput('');
      setPassword('');
      setPoints(100);
      refreshStudents();
      alert('Siswa berhasil ditambahkan dan disinkronkan!');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menambahkan siswa.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        for (let row of json) {
          const sName = row.nama || row.Nama || row.NAME;
          const sPass = row.password || row.Password || '123456';
          const sPoints = Number(row.poin || row.points) || 100;
          if (sName) {
            await axios.post('http://localhost:5000/api/students', {
              name: sName,
              class: selectedClass,
              password: String(sPass),
              points: sPoints
            });
          }
        }
        refreshStudents();
        alert('Data Excel berhasil diimpor dan disinkronkan!');
        e.target.value = null;
      } catch (err) {
        alert('Format Excel tidak valid. Pastikan ada header kolom "nama".');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Fungsi Hapus Siswa
  const handleDelete = async (id, sName) => {
    if (window.confirm(`Hapus siswa "${sName}" beserta akun loginnya?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/students/${id}`);
        refreshStudents();
        alert('Siswa berhasil dihapus.');
      } catch (err) {
        alert('Gagal menghapus siswa.');
      }
    }
  };

  // Filter daftar kelas berdasarkan pencarian nama kelas
  const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);
  const filteredClasses = uniqueClasses.filter(cls => 
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter siswa dalam kelas yang dipilih berdasarkan pencarian nama atau kode siswa
  const studentsInClass = students.filter(s => s.class === selectedClass);
  const filteredStudents = studentsInClass.filter(s => 
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {!selectedClass ? (
        <div className="space-y-6">
          {/* Form Tambah Siswa Baru */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">➕ Tambah Siswa Baru (Lengkap & Terhubung ke User)</h3>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                <input type="text" placeholder="Nama Siswa" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Kelas</label>
                <input type="text" placeholder="Contoh: VII-A" value={classNameInput} onChange={(e) => setClassNameInput(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password / PIN</label>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <button type="submit" className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition">Simpan & Sinkronkan</button>
            </form>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white">Daftar Ruang Kelas (Admin)</h2>
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
                  <div key={idx} onClick={() => { setSelectedClass(cls); setSearchTerm(''); }} className="bg-slate-950/40 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-indigo-500 transition space-y-3">
                    <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold">🏫</div>
                    <h3 className="text-lg font-bold text-white">Kelas {cls}</h3>
                    <p className="text-xs text-slate-400">{students.filter(s => s.class === cls).length} Siswa</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-slate-500 text-xs">Tidak ada kelas yang cocok dengan pencarian.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => { setSelectedClass(null); setSearchTerm(''); }} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl">&larr; Kembali</button>
              <h2 className="text-base font-bold text-white">Kelas: {selectedClass}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="🔍 Cari nama siswa / kode..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-60 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium">
                📥 Import Excel (.xlsx)
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Form Tambah Siswa di dalam Kelas Terpilih */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">➕ Tambah Siswa di Kelas {selectedClass}</h3>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                <input type="text" placeholder="Nama Siswa" value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password / PIN</label>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Poin Keaktifan</label>
                <input type="number" placeholder="100" value={points} onChange={(e) => setPoints(e.target.value)} className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" />
              </div>
              <button type="submit" className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition">Simpan Siswa</button>
            </form>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                  <th className="p-4">QR</th>
                  <th className="p-4">Kode / NIS</th>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Poin</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => (
                    <tr key={s._id} className="hover:bg-white/5">
                      <td className="p-4"><div onClick={() => setSelectedQR(s)} className="bg-white p-2 rounded-xl cursor-pointer"><QRCodeSVG value={s.code} size={40} /></div></td>
                      <td className="p-4 font-mono text-indigo-400">{s.code}</td>
                      <td className="p-4 text-white font-medium">{s.name}</td>
                      <td className="p-4 text-emerald-400 font-semibold">{s.points}</td>
                      <td className="p-4 flex space-x-2">
                        <button 
                          onClick={() => { 
                            setEditingStudent(s); 
                            setEditName(s.name); 
                            setEditClass(s.class); 
                            setEditPassword('');
                            setEditPoints(s.points || 100);
                          }} 
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(s._id, s.name)} 
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500 text-xs">
                      Tidak ada siswa yang cocok dengan pencarian di kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 p-6 rounded-2xl text-center space-y-4 max-w-sm w-full">
            <h3 className="font-bold text-white">QR Code Siswa</h3>
            <div className="bg-white p-4 rounded-xl inline-block"><QRCodeSVG value={selectedQR.code} size={180} /></div>
            <p className="text-white font-semibold">{selectedQR.name}</p>
            <button onClick={() => setSelectedQR(null)} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs">Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 p-6 rounded-2xl space-y-4 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">✏️ Edit Data Siswa</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(`http://localhost:5000/api/students/${editingStudent._id}`, { 
                  name: editName, 
                  class: editClass, 
                  password: editPassword,
                  points: Number(editPoints)
                });
                setEditingStudent(null);
                refreshStudents();
                alert('Data siswa berhasil diperbarui!');
              } catch (err) {
                alert(err.response?.data?.error || 'Gagal memperbarui siswa.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Kelas</label>
                <input type="text" value={editClass} onChange={(e) => setEditClass(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password Baru (Opsional)</label>
                <input type="password" placeholder="Kosongkan jika tidak diubah" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Poin Keaktifan</label>
                <input type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="w-1/2 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Batal</button>
                <button type="submit" className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}