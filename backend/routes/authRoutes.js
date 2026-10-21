const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    
    if (!user) {
      const student = await Student.findOne({ 
        $or: [{ name: username }, { code: username }] 
      });

      if (student) {
        if (!password || password === student.password) {
          user = await User.findOneAndUpdate(
            { username: student.name },
            { role: 'siswa', name: student.name, password: student.password, isOnline: true },
            { upsert: true, returnDocument: 'after' }
          );
        } else {
          return res.status(400).json({ error: 'Password salah!' });
        }
      }
    }

    if (!user) return res.status(404).json({ error: 'Akun atau QR Code tidak ditemukan!' });

    if (user.role !== 'siswa' && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Password salah!' });
    }

    user.isOnline = true;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token, 
      role: user.role, 
      name: user.name, 
      assignments: user.assignments || [] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AMBIL SEMUA USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TAMBAH USER BARU ---
router.post('/users', async (req, res) => {
  try {
    const { name, username, password, role, assignments } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username sudah digunakan!' });

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      role: role || 'siswa',
      assignments: role === 'guru' ? (assignments || []) : []
    });
    res.status(201).json({ message: 'Akun berhasil ditambahkan!', newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- EDIT USER ---
router.put('/users/:id', async (req, res) => {
  try {
    const { name, username, password, role, assignments } = req.body;
    
    let updateData = { 
      name, 
      username, 
      role, 
      assignments: role === 'guru' ? (assignments || []) : [] 
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { returnDocument: 'after', runValidators: true } 
    );

    if (!updatedUser) return res.status(404).json({ error: 'Pengguna tidak ditemukan!' });

    res.json({ message: 'Akun berhasil diperbarui!', updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- HAPUS USER ---
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Pengguna tidak ditemukan!' });
    res.json({ message: 'Akun berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;