const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePDF(user, record) {
  const reportsDir = path.join(__dirname, '../reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfFilename = `${user._id}-${Date.now()}.pdf`;
  const pdfPath = path.join(reportsDir, pdfFilename);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(pdfPath);

  doc.pipe(stream);

  doc.fontSize(24).text('Skin Disease Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(16).text(`User: ${user.name}`);
  doc.fontSize(12).text(`Email: ${user.email}`);
  doc.text(`Prediction: ${record.prediction || 'N/A'}`);
  doc.text(`Scan Date: ${record.date ? new Date(record.date).toLocaleString() : 'N/A'}`);
  doc.moveDown();

  if (record.appointment && record.appointment.doctorName) {
    doc.fontSize(16).text('Doctor Appointment');
    doc.fontSize(12).text(`Doctor: ${record.appointment.doctorName}`);
    doc.text(`Specialty: ${record.appointment.specialty || 'Dermatologist'}`);
    doc.text(`Hospital: ${record.appointment.hospital || 'N/A'}`);
    doc.text(`Location: ${record.appointment.location || 'N/A'}`);
    doc.text(
      `Appointment Date: ${
        record.appointment.appointmentDate
          ? new Date(record.appointment.appointmentDate).toLocaleString()
          : 'N/A'
      }`
    );
    doc.text(`Status: ${record.appointment.status || 'Booked'}`);
    if (record.appointment.notes) {
      doc.text(`Notes: ${record.appointment.notes}`);
    }
    doc.moveDown();
  }

  if (record.uploadedReport && record.uploadedReport.originalName) {
    doc.fontSize(16).text('Uploaded PDF Report');
    doc.fontSize(12).text(`File Name: ${record.uploadedReport.originalName}`);
    doc.text(
      `Uploaded At: ${
        record.uploadedReport.uploadedAt
          ? new Date(record.uploadedReport.uploadedAt).toLocaleString()
          : 'N/A'
      }`
    );
    doc.moveDown();
  }

  if (record.imagePath) {
    try {
      const fileName = path.basename(record.imagePath);
      const finalImagePath = path.join(__dirname, '..', 'uploads', fileName);

      if (fs.existsSync(finalImagePath)) {
        doc.fontSize(16).text('Scanned Image');
        doc.moveDown(0.5);
        doc.image(finalImagePath, { fit: [220, 220], align: 'center' });
      }
    } catch (err) {
      console.log('Image error:', err.message);
    }
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return pdfFilename;
}

module.exports = { generatePDF };
