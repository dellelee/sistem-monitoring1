import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

export default function Login({ setToken, setRole, setUserName }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const executeLogin = async (loginData, restartScannerCallback) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', loginData);

      const { token, role, name, assignments } = res.data;

      // Set State
      setToken(token);
      setRole(role);
      setUserName(name);

      // Simpan ke localStorage termasuk assignments jika role adalah guru
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      if (assignments) {
        localStorage.setItem('assignments', JSON.stringify(assignments));
      } else {
        localStorage.removeItem('assignments');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login gagal / QR Code tidak dikenali!';
      setWarningMsg(`⚠️ ${msg}`);
      setError('');

      setTimeout(() => {
        setWarningMsg('');
        if (restartScannerCallback) restartScannerCallback();
      }, 2500);
    }
  };

  useEffect(() => {
    let html5QrCode;
    let active = true;

    const startCam = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const camId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
          
          const runScan = async () => {
            if (!active) return;
            try {
              await html5QrCode.start(
                camId,
                { fps: 10, qrbox: { width: 220, height: 220 } },
                async (text) => {
                  if (html5QrCode.isScanning) await html5QrCode.stop();
                  await executeLogin({ username: text, password: '' }, () => {
                    if (active) runScan();
                  });
                },
                () => {}
              );
              setCameraActive(true);
            } catch (e) {
              console.error(e);
            }
          };
          await runScan();
        } else {
          setError('Kamera tidak ditemukan.');
        }
      } catch (e) {
        setError('Akses kamera ditolak.');
      }
    };

    startCam();
    return () => {
      active = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/30">
            MS
          </div>
          <h2 className="text-xl font-bold text-white">Login Sistem Monitoring</h2>
          <p className="text-xs text-slate-400">Scan QR Code Siswa atau Gunakan Manual</p>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">{error}</div>}

        <div className="space-y-2">
          <div className="p-3 bg-slate-950/80 border border-white/10 rounded-2xl relative overflow-hidden">
            <div id="reader" className="w-full rounded-xl overflow-hidden"></div>
            {!cameraActive && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-slate-400 text-xs">
                Memuat kamera...
              </div>
            )}
            {warningMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-amber-950/80 backdrop-blur-sm text-amber-200 text-xs font-semibold p-4 text-center">
                {warningMsg}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase">Atau Manual</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); executeLogin({ username, password }); }} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Username / Nama</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-500/20">
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}