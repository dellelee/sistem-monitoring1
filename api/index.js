const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Impor model dan routes dari folder backend
const User = require('../backend/models/User');
const authRoutes = require('../backend/routes/authRoutes');
const studentRoutes = require('../backend/routes/studentRoutes');
const soalRoutes = require('../backend/routes/soalRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root endpoint agar tidak blank/menampilkan teks tes
app.get('/', (req, res) => {
  res.send('API Sistem Monitoring Berjalan Normal');
});

// Koneksi ke MongoDB Atlas dengan Lazy Connection (Aman untuk Serverless Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Terhubung');
    await createDefaultAdmin();
  } catch (err) {
    console.log('Koneksi MongoDB Gagal:', err);
  }
};

// Fungsi otomatis buat akun admin default jika belum ada
const createDefaultAdmin = async () => {
  try {
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      const hp = await bcrypt.hash('123', 10);
      await User.create({ username: 'admin', password: hp, role: 'admin', name: 'Administrator Utama' });
      console.log('Akun Admin Default Berhasil Dibuat.');
    }
  } catch (err) {
    console.error(err);
  }
};

// Middleware untuk memastikan database terhubung di setiap request API
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Hubungkan Router API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/soal', soalRoutes);

module.exports = app;