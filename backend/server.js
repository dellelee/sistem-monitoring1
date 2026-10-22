const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const soalRoutes = require('./routes/soalRoutes');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
// Tambahkan baris ini agar root path tidak Cannot GET /
app.get('/', (req, res) => {
  res.send('API Sistem Monitoring Berjalan Normal');
});

// 🛠️ TAMBAHKAN LIMIT DI SINI (Contoh: 50mb untuk menampung file Excel & data besar)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Hubungkan Router API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/soal', soalRoutes);

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

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Terhubung');
    await createDefaultAdmin();
  })
  .catch((err) => console.log('Koneksi MongoDB Gagal:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server modular berjalan di port ${PORT}`));