const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB Atlas (menggunakan environment variable dari Vercel)
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

// Hubungkan rute backend yang sudah Anda miliki
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