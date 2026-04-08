import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Webcam from 'react-webcam';
import './Predict.css';
import { useLanguage } from '../../context/LanguageContext';
import getStoredToken from '../../utils/getStoredToken';

const appointmentSlots = [
  '09:00',
  '10:30',
  '12:00',
  '14:00',
  '15:30',
  '17:00'
];

const supportedCities = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai'];

const getTodayDate = () => new Date().toISOString().split('T')[0];

const Predict = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedImageURL, setCroppedImageURL] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [top3, setTop3] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDay, setAppointmentDay] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reportMessage, setReportMessage] = useState('');
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem('latestPredictionResult');

      if (!savedResult) {
        return;
      }

      const parsedResult = JSON.parse(savedResult);

      setPrediction(parsedResult.prediction || null);
      setConfidence(parsedResult.confidence != null ? parsedResult.confidence : null);
      setTop3(Array.isArray(parsedResult.top3) ? parsedResult.top3 : null);
      setRecommendedDoctors(Array.isArray(parsedResult.recommendedDoctors) ? parsedResult.recommendedDoctors : []);
      setRecordId(parsedResult.recordId || null);
      setSelectedCity(parsedResult.selectedCity || '');
      setSelectedDoctorId(parsedResult.selectedDoctorId || '');
      setAppointmentDay(parsedResult.appointmentDay || '');
      setAppointmentTime(parsedResult.appointmentTime || '');
      setAppointmentMessage(parsedResult.appointmentMessage || '');
      setReportMessage(parsedResult.reportMessage || '');
    } catch (storageError) {
      console.error('Could not restore latest prediction result', storageError);
    }
  }, []);

  useEffect(() => {
    if (!prediction || !recordId) {
      return;
    }

    localStorage.setItem(
      'latestPredictionResult',
      JSON.stringify({
        prediction,
        confidence,
        top3,
        recommendedDoctors,
        recordId,
        selectedCity,
        selectedDoctorId,
        appointmentDay,
        appointmentTime,
        appointmentMessage,
        reportMessage
      })
    );
  }, [
    prediction,
    confidence,
    top3,
    recommendedDoctors,
    recordId,
    selectedCity,
    selectedDoctorId,
    appointmentDay,
    appointmentTime,
    appointmentMessage,
    reportMessage
  ]);

  const onFileChange = (e) => {
    const nextFile = e.target.files && e.target.files[0];
    if (!nextFile) {
      return;
    }

    setFile(URL.createObjectURL(nextFile));
  };

  const filteredDoctors = useMemo(
    () => (selectedCity ? recommendedDoctors.filter((doctor) => doctor.location === selectedCity) : []),
    [recommendedDoctors, selectedCity]
  );

  useEffect(() => {
    if (!selectedCity) {
      setSelectedDoctorId('');
      return;
    }

    if (filteredDoctors.length === 0) {
      setSelectedDoctorId('');
      return;
    }

    const stillValidSelection = filteredDoctors.some((doctor) => doctor.id === selectedDoctorId);
    if (!stillValidSelection) {
      setSelectedDoctorId(filteredDoctors[0].id);
    }
  }, [selectedCity, selectedDoctorId, filteredDoctors]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFile(imageSrc);
  };

  const getCropData = () => {
    if (!cropper) {
      alert(t('select_crop_alert'));
      return;
    }

    cropper.getCroppedCanvas().toBlob((blob) => {
      const croppedFile = new File([blob], 'croppedImage.jpg', {
        type: 'image/jpeg'
      });
      setCroppedImage(croppedFile);
      setCroppedImageURL(URL.createObjectURL(croppedFile));
    }, 'image/jpeg');
  };

  const resetRecommendationFlow = () => {
    setRecommendedDoctors([]);
    setRecordId(null);
    setSelectedCity('');
    setSelectedDoctorId('');
    setAppointmentDay('');
    setAppointmentTime('');
    setAppointmentNotes('');
    setAppointmentMessage('');
    setReportFile(null);
    setReportMessage('');
    localStorage.removeItem('latestPredictionResult');
  };

  const resetPredictPage = () => {
    setFile(null);
    setCroppedImage(null);
    setCroppedImageURL(null);
    setPrediction(null);
    setConfidence(null);
    setTop3(null);
    setCropper(null);
    setUseCamera(false);
    setError(null);
    resetRecommendationFlow();
    localStorage.removeItem('prediction');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!croppedImage) {
      alert(t('crop_first_alert'));
      return;
    }

    const formData = new FormData();
    formData.append('image', croppedImage);

    try {
      setIsPredicting(true);
      setError(null);
      resetRecommendationFlow();

      const res = await axios.post('http://localhost:5000/api/predictions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': getStoredToken()
        }
      });

      setPrediction(res.data.prediction);
      localStorage.setItem('prediction', res.data.prediction);
      setConfidence(res.data.confidence != null ? res.data.confidence : null);
      setTop3(Array.isArray(res.data.top3) ? res.data.top3 : null);
      setRecommendedDoctors(Array.isArray(res.data.recommendedDoctors) ? res.data.recommendedDoctors : []);
      setRecordId(res.data.recordId || null);
      setSelectedCity('');
      setSelectedDoctorId('');
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('predict_failed'));
    } finally {
      setIsPredicting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!recordId) {
      return;
    }

    try {
      setDownloadingPdf(true);
      const res = await axios.get(`http://localhost:5000/api/predictions/pdf/${recordId}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': getStoredToken()
        }
      });

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(t('download_failed'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    if (!recordId || !selectedCity || !selectedDoctorId || !appointmentDay || !appointmentTime) {
      setAppointmentMessage(t('appointment_validation'));
      return;
    }

    const selectedDoctor = filteredDoctors.find((doctor) => doctor.id === selectedDoctorId);

    if (!selectedDoctor) {
      setAppointmentMessage(t('appointment_doctor_missing'));
      return;
    }

    try {
      setSubmittingAppointment(true);
      const res = await axios.post(
        `http://localhost:5000/api/predictions/appointment/${recordId}`,
        {
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          hospital: selectedDoctor.hospital,
          location: selectedDoctor.location,
          appointmentDate: `${appointmentDay}T${appointmentTime}`,
          notes: appointmentNotes
        },
        {
          headers: {
            'x-auth-token': getStoredToken()
          }
        }
      );

      const successMessage = res.data.msg || t('appointment_success');
      setAppointmentMessage(successMessage);
      window.alert(successMessage);
      resetPredictPage();
    } catch (err) {
      console.error(err);
      setAppointmentMessage(t('appointment_failed'));
    } finally {
      setSubmittingAppointment(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();

    if (!recordId || !reportFile) {
      setReportMessage(t('report_validation'));
      return;
    }

    const formData = new FormData();
    formData.append('report', reportFile);

    try {
      setUploadingReport(true);
      const res = await axios.post(
        `http://localhost:5000/api/predictions/report/${recordId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': getStoredToken()
          }
        }
      );

      setReportMessage(res.data.msg || t('report_upload_success'));
    } catch (err) {
      console.error(err);
      setReportMessage(t('report_upload_failed'));
    } finally {
      setUploadingReport(false);
    }
  };

  return (
    <div className="predict-container">
      <h2>{t('predict_title')}</h2>
      <form onSubmit={onSubmit} className="predict-form">
        <input type="file" accept="image/*" onChange={onFileChange} />
        <button
          type="button"
          onClick={() => setUseCamera(!useCamera)}
          className="btn"
        >
          {useCamera ? t('stop_camera') : t('use_camera')}
        </button>

        {useCamera && (
          <div className="webcam-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
            />
            <button type="button" onClick={capture} className="btn">
              {t('capture_photo')}
            </button>
          </div>
        )}

        {file && (
          <Cropper
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            src={file}
            viewMode={1}
            guides={false}
            scalable={true}
            cropBoxResizable={true}
            onInitialized={(instance) => setCropper(instance)}
          />
        )}

        <button type="button" onClick={getCropData} className="btn">
          {t('crop_image')}
        </button>
        <button type="submit" className="btn" disabled={isPredicting}>
          {isPredicting ? t('predicting_button') : t('predict_button')}
        </button>
      </form>

      {croppedImageURL && (
        <div className="cropped-image-container">
          <h3>{t('cropped_image_title')}</h3>
          <img src={croppedImageURL} alt="Cropped" />
        </div>
      )}

      {isPredicting && (
        <div className="prediction-loading-card">
          <div className="prediction-spinner" />
          <h3>{t('prediction_loading_title')}</h3>
          <p>{t('prediction_loading_text')}</p>
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <div>
            {t('prediction_result')}: <strong>{prediction}</strong>
            {confidence != null && (
              <span className="confidence-chip">
                ({(Number(confidence) * 100).toFixed(1)}% {t('confidence_label')})
              </span>
            )}
          </div>

          {top3 && top3.length > 0 && (
            <ul className="top-predictions-list">
              {top3.map((row) => (
                <li key={row.label}>
                  {row.label}: {(Number(row.probability) * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          )}

          {recordId && (
            <button
              type="button"
              className="btn result-download-btn"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? t('downloading_pdf') : t('download_pdf_now')}
            </button>
          )}
        </div>
      )}

      {prediction && (
        <div className="care-panel">
          <div className="care-section">
            <h3>{t('doctor_recommendation_title')}</h3>
            <p className="care-subtitle">{t('doctor_recommendation_subtitle')}</p>
            <label className="care-label">{t('appointment_select_city')}</label>
            <select
              className="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">{t('appointment_select_city_placeholder')}</option>
              {supportedCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {recommendedDoctors.length === 0 ? (
              <p>{t('doctor_recommendation_empty')}</p>
            ) : !selectedCity ? (
              <p>{t('appointment_city_hint')}</p>
            ) : filteredDoctors.length === 0 ? (
              <p>{t('doctor_recommendation_city_empty')}</p>
            ) : (
              <div className="doctor-grid">
                {filteredDoctors.map((doctor) => (
                  <label
                    key={doctor.id}
                    className={`doctor-card ${selectedDoctorId === doctor.id ? 'doctor-card-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="doctor"
                      value={doctor.id}
                      checked={selectedDoctorId === doctor.id}
                      onChange={() => setSelectedDoctorId(doctor.id)}
                    />
                    <div>
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialty}</p>
                      <p>{doctor.hospital}</p>
                      <p>{doctor.location}</p>
                      <p>{doctor.experience}</p>
                      <p>{doctor.availability}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="care-section">
            <h3>{t('appointment_title')}</h3>
            <form onSubmit={handleAppointmentSubmit} className="care-form">
              <label className="care-label">{t('appointment_select_date')}</label>
              <input
                type="date"
                min={getTodayDate()}
                value={appointmentDay}
                onChange={(e) => setAppointmentDay(e.target.value)}
              />
              <label className="care-label">{t('appointment_select_time')}</label>
              <div className="time-slot-grid">
                {appointmentSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-btn ${appointmentTime === slot ? 'time-slot-btn-selected' : ''}`}
                    onClick={() => setAppointmentTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <textarea
                rows="4"
                placeholder={t('appointment_notes_placeholder')}
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
              />
              <button type="submit" className="btn" disabled={submittingAppointment}>
                {submittingAppointment ? t('appointment_booking') : t('appointment_button')}
              </button>
            </form>
            {appointmentMessage && <p className="info-message">{appointmentMessage}</p>}
          </div>

          <div className="care-section">
            <h3>{t('report_upload_title')}</h3>
            <form onSubmit={handleReportUpload} className="care-form">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setReportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
              <button type="submit" className="btn" disabled={uploadingReport}>
                {uploadingReport ? t('report_uploading') : t('report_upload_button')}
              </button>
            </form>
            {reportMessage && <p className="info-message">{reportMessage}</p>}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Predict;
