import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentProfile, updateProfile } from '../../actions/profileActions';
import './Profile.css';
import { useLanguage } from '../../context/LanguageContext';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.profile);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    healthIssues: '',
    avatar: ''
  });

  const [file, setFile] = useState(null);

  useEffect(() => {
    dispatch(getCurrentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        contact: profile.contact || '',
        healthIssues: profile.healthIssues ? profile.healthIssues.join(', ') : '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);

  const { name, email, contact, healthIssues, avatar } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => setFile(e.target.files[0]);

  const onSubmit = e => {
    e.preventDefault();
    const updateData = new FormData();
    updateData.append('name', name);
    updateData.append('email', email);
    if (contact) updateData.append('contact', contact);
    if (healthIssues) updateData.append('healthIssues', JSON.stringify(healthIssues.split(', ').map(issue => issue.trim()))); // Convert to array and then to JSON string
    if (file) updateData.append('avatar', file);

    dispatch(updateProfile(updateData));
  };

  return (
    <div className="profile-container">
      <h2>{t('profile_title')}</h2>
      <div className="avatar-container">
        <img 
          src={avatar ? avatar : '/default-avatar.png'} 
          alt={t('avatar_alt')}
          className="avatar" 
        />
      </div>
      <form onSubmit={onSubmit} className="profile-form">
        <div className="form-group">
          <label>{t('name_label')}</label>
          <input type="text" name="name" value={name} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>{t('email_label')}</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>{t('contact_label')}</label>
          <input type="text" name="contact" value={contact} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>{t('health_issues_label')}</label>
          <input type="text" name="healthIssues" value={healthIssues} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>{t('avatar_label')}</label>
          <input type="file" onChange={onFileChange} />
        </div>
        <button type="submit" className="btn">{t('update_profile_button')}</button>
      </form>
    </div>
  );
};

export default Profile;
