import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function KelasSiswa({ students }) {
  const currentUserName = localStorage.getItem('name');
  const myData = students.find(s => s.name === currentUserName);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/65 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white border-b border-white/10 pb-4">Informasi Kelas Saya</h2>
        {myData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-400">Nama Lengkap:</span> <span className="text-white font-medium">{myData.name}</span></p>
              <p><span className="text-slate-400">Kelas:</span> <span className="text-indigo-400 font-medium">{myData.class}</span></p>
              <p><span className="text-slate-400">Kode Unik / NIS:</span> <span className="text-indigo-400 font-mono font-bold">{myData.code}</span></p>
              <p><span className="text-slate-400">Poin Keaktifan:</span> <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">{myData.points}</span></p>
            </div>
            <div className="text-center bg-slate-950/40 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={myData.code} size={130} />
              </div>
              <p className="text-[11px] text-slate-400">QR Code Kartu Siswa Anda</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-xs text-center py-8">Data siswa tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
}