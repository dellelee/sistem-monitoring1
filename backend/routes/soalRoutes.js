const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Soal = require('../models/Soal');
const Student = require('../models/Student');

// --- AMBIL SEMUA SOAL (DIPERBAIKI AGAR PENCARIAN MAPEL FLEKSIBEL & TIDAK CASE-SENSITIVE) ---
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    let query = {};

    if (subject) {
      // Menggunakan pencocokan regex agar aman dari perbedaan huruf besar/kecil atau spasi
      query.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    const list = await Soal.find(query);
    
    // Jika dengan filter subject kosong, fallback ambil semua agar frontend bisa memilih
    let finalList = list;
    if (list.length === 0 && subject) {
      finalList = await Soal.find();
    }
    
    // Normalisasi data agar frontend selalu mendapati properti questionText & image dengan aman
    const formattedList = finalList.map(item => {
      const doc = item.toObject();
      if (doc.questions && Array.isArray(doc.questions)) {
        doc.questions = doc.questions.map(q => ({
          ...q,
          questionText: q.questionText || q.question || 'Pertanyaan tidak tersedia',
          image: q.image || ''
        }));
      }
      return doc;
    });

    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPLOAD SOAL VIA EXCEL ---
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, targetClasses, semester, meeting, category, teacherName } = req.body;
    const file = req.file;

    if (!file || !subject) {
      return res.status(400).json({ error: 'File Excel atau Mata Pelajaran tidak boleh kosong!' });
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({ error: 'File Excel kosong atau format tidak valid!' });
    }

    const parsedQuestions = sheetData.map(row => {
      const options = [
        row.A || row.option_a || '',
        row.B || row.option_b || '',
        row.C || row.option_c || '',
        row.D || row.option_d || '',
        row.E || row.option_e || ''
      ].filter(opt => opt !== '' && opt !== null && opt !== undefined);

      let qType = row.tipe ? String(row.tipe).toLowerCase().trim() : 'radio';
      const kunciStr = String(row.kunci || row.jawaban || '');

      if (!['radio', 'checkbox', 'essay'].includes(qType)) {
        if (kunciStr.includes(',') || kunciStr.length > 2) {
          qType = 'checkbox';
        } else if (options.length === 0) {
          qType = 'essay';
        } else {
          qType = 'radio';
        }
      }

      const points = Number(row.bobot || row.points || row.poin) || 10;
      const image = row.image || row.gambar || row.Image || '';

      return {
        questionText: row.soal || row.Soal || row.question || '',
        image,
        questionType: qType,
        options,
        correctAnswer: kunciStr,
        points
      };
    }).filter(q => q.questionText);

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ error: 'Gagal membaca pertanyaan dari file Excel.' });
    }

    let parsedClasses = targetClasses;
    if (typeof targetClasses === 'string') {
      try { 
        parsedClasses = JSON.parse(targetClasses); 
      } catch (e) { 
        parsedClasses = [targetClasses]; 
      }
    }

    const newSoalPackage = new Soal({
      title: title || 'Ujian Excel',
      subject: subject.trim(),
      targetClasses: parsedClasses || [],
      semester: semester || 'semester1',
      meeting: Number(meeting) || 1,
      category: category || 'individu',
      teacherName: teacherName || 'Administrator',
      questions: parsedQuestions,
      submittedStudents: []
    });

    await newSoalPackage.save();
    res.status(201).json({ message: 'Paket soal berhasil diunggah dari Excel!', newSoalPackage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BUAT SOAL MANUAL ---
router.post('/manual', async (req, res) => {
  try {
    const { title, subject, targetClasses, semester, meeting, category, teacherName, questions } = req.body;
    
    const formattedQuestions = (questions || []).map(q => ({
      questionText: q.questionText || q.question || '',
      image: q.image || '',
      questionType: q.questionType || 'radio',
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      points: Number(q.points) || 10
    }));

    const newSoal = new Soal({ 
      title, 
      subject: subject ? subject.trim() : 'TIK', 
      targetClasses, 
      semester, 
      meeting: Number(meeting), 
      category, 
      teacherName, 
      questions: formattedQuestions,
      submittedStudents: []
    });

    await newSoal.save();
    res.status(201).json({ message: 'Paket soal manual berhasil disimpan!', newSoal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- HAPUS SOAL ---
router.delete('/:id', async (req, res) => {
  try {
    await Soal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Soal berhasil dihapus!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBMIT UJIAN SISWA & CEK 1 KALI KERJAKAN ---
router.post('/submit', async (req, res) => {
  try {
    const { studentName, examId, answers, meetingKey, semester, category } = req.body;
    
    const soalDoc = await Soal.findById(examId);
    if (!soalDoc) return res.status(404).json({ error: 'Ujian tidak ditemukan!' });

    if (!soalDoc.submittedStudents) {
      soalDoc.submittedStudents = [];
    }

    if (soalDoc.submittedStudents.includes(studentName)) {
      return res.status(400).json({ error: 'Anda sudah pernah mengerjakan ujian ini dan tidak dapat mengirimkannya lagi!' });
    }

    let earnedPoints = 0;
    let maxPossiblePoints = 0;

    soalDoc.questions.forEach((q, idx) => {
      const weight = q.points || 10;
      maxPossiblePoints += weight;

      const studentAns = answers[idx];
      if (studentAns === undefined || studentAns === null || studentAns === '') return;

      if (q.questionType === 'radio') {
        const correctArr = q.correctAnswer.toUpperCase().replace(/\s+/g, '').split(',');
        const optIndex = q.options.indexOf(studentAns);
        const studentLetter = optIndex !== -1 ? String.fromCharCode(65 + optIndex) : '';
        
        if (correctArr.includes(studentLetter) || correctArr.includes(String(studentAns).toUpperCase().trim())) {
          earnedPoints += weight;
        }
      } else if (q.questionType === 'checkbox' && Array.isArray(studentAns)) {
        const correctArr = q.correctAnswer.toUpperCase().replace(/\s+/g, '').split(',');
        const studentLetters = studentAns.map(ans => {
          const idxOpt = q.options.indexOf(ans);
          return idxOpt !== -1 ? String.fromCharCode(65 + idxOpt) : String(ans).toUpperCase().trim();
        });

        const isMatch = correctArr.length === studentLetters.length && correctArr.every(val => studentLetters.includes(val));
        if (isMatch) {
          earnedPoints += weight;
        }
      } else if (q.questionType === 'essay') {
        if (String(studentAns).trim().length > 0) {
          earnedPoints += weight;
        }
      }
    });

    const finalGrade = maxPossiblePoints > 0 ? Math.round((earnedPoints / maxPossiblePoints) * 100) : 0;

    const student = await Student.findOne({ name: studentName });
    if (student) {
      if (!student.grades) student.grades = {};
      if (!student.grades[soalDoc.subject]) {
        student.grades[soalDoc.subject] = {
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

      const targetSemester = semester || soalDoc.semester || 'semester1';
      const targetMeeting = meetingKey || `p${soalDoc.meeting || 1}`;
      const targetCategory = category || soalDoc.category || 'individu';

      if (student.grades[soalDoc.subject][targetSemester]) {
        if (typeof student.grades[soalDoc.subject][targetSemester][targetMeeting] !== 'object') {
          const oldVal = Number(student.grades[soalDoc.subject][targetSemester][targetMeeting]) || 0;
          student.grades[soalDoc.subject][targetSemester][targetMeeting] = { individu: oldVal, kelompok: oldVal, praktik: oldVal };
        }

        student.grades[soalDoc.subject][targetSemester][targetMeeting][targetCategory] = finalGrade;
        student.markModified('grades');
        await student.save();
      }
    }

    soalDoc.submittedStudents.push(studentName);
    await soalDoc.save();

    res.status(200).json({ message: 'Ujian berhasil dinilai dan disinkronkan!', finalGrade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;