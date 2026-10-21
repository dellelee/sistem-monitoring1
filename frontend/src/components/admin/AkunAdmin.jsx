import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function AkunAdmin() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  
  // State Pencarian
  const [searchTerm, setSearchTerm] = useState('');

  // State Form Tambah/Edit Akun
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('siswa');
  const [editingId, setEditingId] = useState(null);

  // State khusus penugasan Guru (Array of { subject, classes: [] })
  const [assignments, setAssignments] = useState([{ subject: 'TIK', classes: '' }]);

  const subjectsList = ['TIK', 'Matematika', 'Bahasa Indonesia', 'IPA', 'IPS'];

  const fetchData = async () => {
    try {
      const [userRes, studentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/users'),
        axios.get('http://localhost:5000/api/students')
      ]);
      setUsers(userRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStudentInfo = (u) => {
    let student = students.find(s => s.name === u.name || s.name === u.username);
    if (!student) {
      return { code: 'STU-' + (u.username ? u.username.toUpperCase() : 'USER') };
    }
    return student;
  };

  // Handler untuk menambah baris penugasan guru
  const handleAddAssignmentRow = () => {
    setAssignments([...assignments, { subject: 'TIK', classes: '' }]);
  };

  const handleAssignmentChange = (index, field, value) => {
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  const handleRemoveAssignmentRow = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const formattedAssignments = userRole === 'guru' ? assignments.map(a => ({
        subject: a.subject,
        classes: typeof a.classes === 'string' ? a.classes.split(',').map(c => c.trim()).filter(Boolean) : a.classes
      })) : [];

      const payload = {
        name,
        username,
        role: userRole,
        assignments: formattedAssignments
      };

      if (password.trim() !== '') {
        payload.password = password;
      } else if (!editingId) {
        alert('Password wajib diisi untuk akun baru!');
        return;
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/auth/users/${editingId}`, payload);
        alert('Akun berhasil diperbarui!');
      } else {
        await axios.post('http://localhost:5000/api/auth/users', payload);
        alert('Akun berhasil ditambahkan!');
      }

      setName('');
      setUsername('');
      setPassword('');
      setUserRole('siswa');
      setAssignments([{ subject: 'TIK', classes: '' }]);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan akun');
    }
  };

  const handleStartEdit = (u) => {
    setEditingId(u._id);
    setName(u.name || '');
    setUsername(u.username || '');
    setPassword(''); // Kosongkan password saat awal edit agar aman
    setUserRole(u.role || 'siswa');
    if (u.role === 'guru' && u.assignments && u.assignments.length > 0) {
      setAssignments(u.assignments.map(a => ({
        subject: a.subject || 'TIK',
        classes: Array.isArray(a.classes) ? a.classes.join(', ') : (a.classes || '')
      })));
    } else {
      setAssignments([{ subject: 'TIK', classes: '' }]);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Hapus akun "${name}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
        fetchData();
        alert('Akun berhasil dihapus.');
      } catch (err) {
        alert('Gagal menghapus akun.');
      }
    }
  };

  // Filter daftar pengguna berdasarkan kata kunci pencarian (nama, username, atau role)
  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white">
            {editingId ? '✏️ Edit Akun Pengguna' : '➕ Tambah Akun Baru (Admin/Guru/Siswa)'}
          </h2>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setName(''); setUsername(''); setPassword(''); setUserRole('siswa'); setAssignments([{ subject: 'TIK', classes: '' }]); }}
              className="text-xs text-slate-400 underline"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Username / NIS</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                placeholder={editingId ? 'Kosongkan jika tdk diubah' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white"
              >
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Form Mapping Penugasan Mapel & Kelas Khusus Role GURU */}
          {userRole === 'guru' && (
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-400">
                📚 Penugasan Mengajar (Mata Pelajaran & Kelas)
              </label>
              {assignments.map((assign, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <select
                    value={assign.subject}
                    onChange={(e) => handleAssignmentChange(idx, 'subject', e.target.value)}
                    className="w-1/3 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                  >
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Kelas (Pisahkan koma, contoh: VII-A, VII-B)"
                    value={assign.classes}
                    onChange={(e) => handleAssignmentChange(idx, 'classes', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                    required
                  />
                  {assignments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignmentRow(idx)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAssignmentRow}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                + Tambah Mapel Lain
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            {editingId ? 'Simpan Perubahan Akun' : 'Tambah Akun Baru'}
          </button>
        </form>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        {/* Header & Kolom Pencarian */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white">Daftar Seluruh Pengguna & Penugasan</h2>
          <input
            type="text"
            placeholder="🔍 Cari nama, username, atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                <th className="p-4">QR / Info</th>
                <th className="p-4">Nama</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role & Penugasan Mapel/Kelas</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const studentInfo = getStudentInfo(u);
                  const qrcodeValue = studentInfo ? studentInfo.code : ('STU-' + (u.username ? u.username.toUpperCase() : 'USER'));
                  const isSiswa = u.role?.toLowerCase() === 'siswa';

                  return (
                    <tr key={u._id} className="hover:bg-white/5">
                      <td className="p-4">
                        {isSiswa ? (
                          <div 
                            onClick={() => setSelectedQR({ name: u.name, code: qrcodeValue })} 
                            className="bg-white p-1.5 rounded-lg inline-block shadow cursor-pointer hover:scale-105 transition"
                            title="Klik untuk memperbesar QR"
                          >
                            <QRCodeSVG value={qrcodeValue} size={38} />
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{u.name}</td>
                      <td className="p-4 font-mono text-indigo-400">{u.username}</td>
                      <td className="p-4 text-slate-300">
                        <span className="capitalize font-semibold">{u.role}</span>
                        {u.role === 'guru' && u.assignments && u.assignments.length > 0 && (
                          <div className="text-xs text-indigo-300 mt-1 space-y-0.5">
                            {u.assignments.map((a, i) => (
                              <div key={i}>• <b>{a.subject}</b>: {Array.isArray(a.classes) ? a.classes.join(', ') : a.classes}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isOnline ? (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">Aktif</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs">Offline</span>
                        )}
                      </td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="px-3 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs rounded-lg transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                    Tidak ada akun yang cocok dengan kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl text-center space-y-4 max-w-sm w-full">
            <h3 className="text-base font-bold text-white">QR Code Siswa</h3>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG value={selectedQR.code} size={200} />
            </div>
            <div>
              <p className="text-white font-semibold">{selectedQR.name}</p>
              <p className="text-xs text-slate-400 font-mono">Kode: {selectedQR.code}</p>
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