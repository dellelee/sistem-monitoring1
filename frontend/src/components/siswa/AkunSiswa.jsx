import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function AkunSiswa() {
  const [studentData, setStudentData] = useState(null);
  const currentUserName = localStorage.getItem('name') || 'Siswa';

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students');
        const myData = res.data.find(s => s.name === currentUserName);
        if (myData) setStudentData(myData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudentData();
  }, [currentUserName]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Profil & Kartu Identitas Siswa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-slate-950/40 border border-white/10 p-5 rounded-xl space-y-3 text-xs">
            <p><span className="text-slate-400">Nama Lengkap:</span> <span className="text-white font-medium">{currentUserName}</span></p>
            <p><span className="text-slate-400">Role:</span> <span className="text-indigo-400">Siswa</span></p>
            <p><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-semibold">Aktif (Online)</span></p>
            {studentData && (
              <>
                <p><span className="text-slate-400">Kelas:</span> <span className="text-indigo-400 font-medium">{studentData.class}</span></p>
                <p><span className="text-slate-400">Kode Unik / NIS:</span> <span className="text-indigo-400 font-mono font-bold">{studentData.code}</span></p>
              </>
            )}
          </div>

          <div className="text-center bg-slate-950/40 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-2">
            {studentData?.code ? (
              <div className="bg-white p-3 rounded-xl shadow-inner inline-block">
                <QRCodeSVG value={studentData.code} size={150} />
              </div>
            ) : (
              <p className="text-xs text-slate-500">Memuat QR Code...</p>
            )}
            <p className="text-[11px] text-slate-400">QR Code Kartu Siswa Anda</p>
          </div>
        </div>
      </div>
    </div>
  );
}