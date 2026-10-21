const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  password: { type: String, required: true },
  points: { type: Number, default: 100 },
  grades: { type: Object, default: {} } 
});

module.exports = mongoose.model('Student', studentSchema);