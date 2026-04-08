import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Records.css';
import { useLanguage } from '../../context/LanguageContext';
import getStoredToken from '../../utils/getStoredToken';

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/images/defaultuser.jpeg';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:5000${imagePath}`;
  }

  const normalizedFileName = imagePath.split(/[\\/]/).pop();
  return `http://localhost:5000/uploads/${normalizedFileName}`;
};

const Records = () => {
  const { language, t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = getStoredToken();
        const res = await axios.get('http://localhost:5000/api/users/me/records', {
          headers: {
            'x-auth-token': token
          }
        });

        setRecords(res.data);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(t('failed_load_records'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [t]);

  const handleImageLoad = (recordId) => {
    setImageLoading((prev) => ({ ...prev, [recordId]: true }));
  };

  const downloadPDF = async (recordId) => {
    try {
      const token = getStoredToken();
      const res = await axios.get(`http://localhost:5000/api/predictions/pdf/${recordId}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': token
        }
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record-${recordId}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download Error:', err.response || err);
      alert(t('download_failed'));
    }
  };

  if (loading) {
    return <div className="records-container"><h3>{t('loading')}</h3></div>;
  }

  if (error) {
    return <div className="records-container"><h3>{error}</h3></div>;
  }

  return (
    <div className="records-container">
      <h2>{t('records_title')}</h2>

      {records.length === 0 ? (
        <p>{t('no_records')}</p>
      ) : (
        records.map((record) => (
          <div key={record._id} className="record-item">
            <h3>
              {record.date
                ? new Date(record.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')
                : t('no_date')}
            </h3>

            {!imageLoading[record._id] && (
              <div className="image-placeholder">{t('loading_image')}</div>
            )}

            <img
              src={getImageUrl(record.imagePath)}
              alt="Record"
              className="record-image"
              style={{ display: imageLoading[record._id] ? 'block' : 'none' }}
              onLoad={() => handleImageLoad(record._id)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/defaultuser.jpeg';
                handleImageLoad(record._id);
              }}
            />

            <p>
              <strong>{t('prediction_label')}:</strong> {record.prediction || 'N/A'}
            </p>

            {record.appointment && record.appointment.doctorName && (
              <div className="record-meta-block">
                <p><strong>{t('appointment_title')}:</strong> {record.appointment.doctorName}</p>
                <p><strong>{t('appointment_hospital')}:</strong> {record.appointment.hospital || 'N/A'}</p>
                <p>
                  <strong>{t('appointment_date_label')}:</strong>{' '}
                  {record.appointment.appointmentDate
                    ? new Date(record.appointment.appointmentDate).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US')
                    : 'N/A'}
                </p>
                {record.appointment.notes && (
                  <p><strong>{t('appointment_notes_label')}:</strong> {record.appointment.notes}</p>
                )}
              </div>
            )}

            {record.uploadedReport && record.uploadedReport.filePath && (
              <div className="record-meta-block">
                <p><strong>{t('report_upload_title')}:</strong> {record.uploadedReport.originalName}</p>
                <a
                  href={`http://localhost:5000${record.uploadedReport.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="report-link"
                >
                  {t('view_uploaded_report')}
                </a>
              </div>
            )}

            <button className="btn" onClick={() => downloadPDF(record._id)}>
              {t('download_pdf')}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Records;
