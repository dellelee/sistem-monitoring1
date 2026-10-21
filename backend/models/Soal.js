const mongoose = require('mongoose');

const soalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  targetClasses: [{ type: String, required: true }],
  semester: { type: String, enum: ['semester1', 'semester2'], default: 'semester1', required: true },
  meeting: { type: Number, required: true, default: 1 },
  category: { type: String, enum: ['individu', 'kelompok', 'praktik'], default: 'individu', required: true },
  teacherName: { type: String },
  questions: [{
    questionText: { type: String, required: true },
    image: { type: String }, // 👈 Properti untuk menyimpan URL/path gambar soal
    questionType: { type: String, enum: ['radio', 'checkbox', 'essay'], default: 'radio' },
    options: [{ type: String }],
    correctAnswer: { type: String },
    points: { type: Number, default: 10 }
  }],
  submittedStudents: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Soal', soalSchema);