const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'guru', 'siswa'], default: 'siswa' },
  name: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  // Penugasan khusus untuk Guru: array objek berisi mapel dan daftar kelas yang diajar
  assignments: [
    {
      subject: { type: String, required: true },
      classes: [{ type: String, required: true }]
    }
  ]
});

module.exports = mongoose.model('User', userSchema);