const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Koneksi ke MongoDB Atlas (Lazy Connection untuk Serverless)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Atlas terhubung di Vercel!');
  } catch (err) {
    console.error('Koneksi MongoDB gagal:', err);
  }
}

// ⚠️ SESUAIKAN PATH INI BERDASARKAN FOLDER ANDA
// Karena folder 'backend' berada sejajar dengan folder 'api' di root utama:
const authRoutes = require('../backend/routes/authRoutes');
const soalRoutes = require('../backend/routes/soalRoutes');
const studentRoutes = require('../backend/routes/studentRoutes');

app.use('/api/auth', async (req, res, next) => {
  await connectDB();
  return authRoutes(req, res, next);
});

app.use('/api/soal', async (req, res, next) => {
  await connectDB();
  return soalRoutes(req, res, next);
});

app.use('/api/students', async (req, res, next) => {
  await connectDB();
  return studentRoutes(req, res, next);
});

// Root endpoint untuk tes
app.get('/api', (req, res) => {
  res.json({ message: 'API Sistem Monitoring aktif di Vercel!' });
});

module.exports = app;