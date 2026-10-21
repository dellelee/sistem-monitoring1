const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const User = require('../models/User');

// --- AMBIL SEMUA DATA SISWA ---
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TAMBAH SISWA BARU ---
router.post('/', async (req, res) => {
  try {
    const { name, class: className, password, points } = req.body;
    const uniqueCode = 'STU-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const newStudent = new Student({ 
      code: uniqueCode, 
      name, 
      class: className, 
      password, 
      points: points || 100 
    });
    await newStudent.save();

    // Sinkronisasi otomatis ke tabel User agar bisa login
    const existingUser = await User.findOne({ username: name });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      await User.create({ username: name, password: hashedPassword, role: 'siswa', name: name });
    }

    res.status(201).json({ message: 'Siswa berhasil ditambahkan!', newStudent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- UPDATE / EDIT DATA SISWA ---
router.put('/:id', async (req, res) => {
  try {
    const { name, class: className, password, points } = req.body;
    
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ error: 'Siswa tidak ditemukan!' });

    const oldName = oldStudent.name;

    const updateData = {};
    if (name) updateData.name = name;
    if (className) updateData.class = className;
    if (password) updateData.password = password;
    if (points !== undefined) updateData.points = Number(points);

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });

    let user = await User.findOne({ username: oldName });
    if (user) {
      user.name = student.name;
      user.username = student.name;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash(password || student.password || '123456', 10);
      await User.create({ username: student.name, password: hashedPassword, role: 'siswa', name: student.name });
    }

    res.json({ message: 'Data siswa berhasil diperbarui!', student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- HAPUS SISWA ---
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan!' });

    await Student.findByIdAndDelete(req.params.id);
    await User.findOneAndDelete({ username: student.name });

    res.json({ message: 'Siswa dan akun login terkait berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE NILAI SISWA (DENGAN KATEGORI: INDIVIDU, KELOMPOK, PRAKTIK) ---
router.put('/grades/:id', async (req, res) => {
  try {
    const { subject, semester, meeting, category, value } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan!' });

    if (!student.grades) student.grades = {};
    if (!student.grades[subject]) {
      student.grades[subject] = {
        semester1: { 
          p1: { individu: 0, kelompok: 0, praktik: 0 },
          p2: { individu: 0, kelompok: 0, praktik: 0 },
          p3: { individu: 0, kelompok: 0, praktik: 0 },
          p4: { individu: 0, kelompok: 0, praktik: 0 },
          p5: { individu: 0, kelompok: 0, praktik: 0 },
          p6: { individu: 0, kelompok: 0, praktik: 0 },
          p7: { individu: 0, kelompok: 0, praktik: 0 },
          p8: { individu: 0, kelompok: 0, praktik: 0 }
        },
        semester2: { 
          p1: { individu: 0, kelompok: 0, praktik: 0 },
          p2: { individu: 0, kelompok: 0, praktik: 0 },
          p3: { individu: 0, kelompok: 0, praktik: 0 },
          p4: { individu: 0, kelompok: 0, praktik: 0 },
          p5: { individu: 0, kelompok: 0, praktik: 0 },
          p6: { individu: 0, kelompok: 0, praktik: 0 },
          p7: { individu: 0, kelompok: 0, praktik: 0 },
          p8: { individu: 0, kelompok: 0, praktik: 0 }
        }
      };
    }

    if (student.grades[subject][semester]) {
      // Tanggapan kompatibilitas jika data lama berupa angka tunggal
      if (typeof student.grades[subject][semester][meeting] !== 'object') {
        const oldVal = Number(student.grades[subject][semester][meeting]) || 0;
        student.grades[subject][semester][meeting] = { individu: oldVal, kelompok: oldVal, praktik: oldVal };
      }

      student.grades[subject][semester][meeting][category || 'individu'] = Number(value) || 0;
      
      student.markModified('grades');
      await student.save();
      res.json({ message: 'Nilai kategori diperbarui!', student });
    } else {
      res.status(400).json({ error: 'Semester tidak valid!' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;