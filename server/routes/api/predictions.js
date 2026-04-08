const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const { predictDisease } = require('../../utils/predict');
const { getRecommendedDoctors } = require('../../utils/doctorRecommendations');
const { v4: uuidv4 } = require('uuid');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { generatePDF } = require('../../utils/pdf');

const uploadsDir = path.join(__dirname, '../../uploads');
const reportsDir = path.join(__dirname, '../../reports');

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const imageUpload = multer({ storage: multer.memoryStorage() });
const reportUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDirectory(uploadsDir);
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, `report-${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const getUserAndRecord = async (userId, recordId) => {
  const user = await User.findById(userId);

  if (!user) {
    return { error: { status: 404, body: { msg: 'User not found' } } };
  }

  const record = user.records.id(recordId);

  if (!record) {
    return { error: { status: 404, body: { msg: 'Record not found' } } };
  }

  return { user, record };
};

router.post('/', auth, imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    ensureDirectory(uploadsDir);

    const filename = `${uuidv4()}.jpg`;
    const imagePath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .rotate()
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(imagePath);

    const result = await predictDisease(imagePath, req.user.id);
    const user = await User.findById(req.user.id).select('records');
    const latestRecord = user && user.records.length ? user.records[user.records.length - 1] : null;

    return res.json({
      prediction: result.prediction,
      confidence: result.confidence,
      top3: result.top3,
      imagePath: `/uploads/${filename}`,
      recordId: latestRecord ? latestRecord._id : null,
      recommendedDoctors: getRecommendedDoctors(result.prediction)
    });
  } catch (err) {
    console.error('Prediction Error:', err);
    return res.status(500).send('Server error');
  }
});

router.get('/recommendations/:recordId', auth, async (req, res) => {
  try {
    const { user, record, error } = await getUserAndRecord(req.user.id, req.params.recordId);

    if (error) {
      return res.status(error.status).json(error.body);
    }

    return res.json({
      prediction: record.prediction,
      recommendedDoctors: getRecommendedDoctors(record.prediction)
    });
  } catch (err) {
    console.error('Recommendation Error:', err);
    return res.status(500).send('Server error');
  }
});

router.post('/appointment/:recordId', auth, async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      specialty,
      hospital,
      location,
      appointmentDate,
      notes
    } = req.body;

    if (!doctorId || !doctorName || !appointmentDate) {
      return res.status(400).json({ msg: 'Doctor and appointment date are required' });
    }

    const { user, record, error } = await getUserAndRecord(req.user.id, req.params.recordId);

    if (error) {
      return res.status(error.status).json(error.body);
    }

    record.appointment = {
      doctorId,
      doctorName,
      specialty: specialty || 'Dermatologist',
      hospital: hospital || '',
      location: location || '',
      appointmentDate: new Date(appointmentDate),
      notes: notes || '',
      status: 'Booked',
      bookedAt: new Date()
    };

    await user.save();

    return res.json({
      msg: 'Appointment booked successfully',
      appointment: record.appointment
    });
  } catch (err) {
    console.error('Appointment Error:', err);
    return res.status(500).send('Server error');
  }
});

router.post('/report/:recordId', auth, (req, res) => {
  reportUpload.single('report')(req, res, async (uploadError) => {
    try {
      if (uploadError) {
        return res.status(400).json({ msg: uploadError.message || 'Report upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'Please upload a PDF report' });
      }

      const { user, record, error } = await getUserAndRecord(req.user.id, req.params.recordId);

      if (error) {
        return res.status(error.status).json(error.body);
      }

      record.uploadedReport = {
        originalName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        size: req.file.size,
        uploadedAt: new Date()
      };

      await user.save();

      return res.json({
        msg: 'PDF report uploaded successfully',
        uploadedReport: record.uploadedReport
      });
    } catch (err) {
      console.error('Report Upload Error:', err);
      return res.status(500).send('Server error');
    }
  });
});

router.get('/pdf/:recordId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const record = user.records.id(req.params.recordId);

    if (!record) {
      return res.status(404).json({ msg: 'Record not found' });
    }

    ensureDirectory(reportsDir);

    const pdfFilename = await generatePDF(user, record);
    const finalPath = path.join(reportsDir, pdfFilename);

    if (!fs.existsSync(finalPath)) {
      return res.status(404).send('PDF not found');
    }

    return res.download(finalPath);
  } catch (err) {
    console.error('PDF Route Error:', err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
