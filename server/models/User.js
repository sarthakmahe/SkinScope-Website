const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  contact: { type: String },
  healthIssues: { type: [String] },
  role: { type: String, default: 'user' },
  records: [
    {
      imagePath: { type: String },
      prediction: { type: String },
      appointment: {
        doctorId: { type: String },
        doctorName: { type: String },
        specialty: { type: String },
        hospital: { type: String },
        location: { type: String },
        appointmentDate: { type: Date },
        notes: { type: String },
        status: { type: String, default: 'Booked' },
        bookedAt: { type: Date }
      },
      uploadedReport: {
        originalName: { type: String },
        filePath: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date }
      },
      date: { type: Date, default: Date.now }
    }
  ],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('user', UserSchema);
