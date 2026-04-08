import React, { useState } from 'react';
import './Contact.css';
import { useLanguage } from '../../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const { name, email, message } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      alert(t('contact_fill_all'));
      return;
    }

    const mailtoLink = `mailto:l201027@lhr.nu.edu.pk?subject=${encodeURIComponent(
      `${t('contact_subject_prefix')} ${name}`
    )}&body=${encodeURIComponent(message)}%0D%0A%0D%0AFrom:%20${encodeURIComponent(
      name
    )}%0D%0AEmail:%20${encodeURIComponent(email)}`;

    window.location.href = mailtoLink;
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h2>{t('contact_title')}</h2>
        <p className="contact-subtext">{t('contact_subtext')}</p>

        {submitted && <p className="success-msg">{t('contact_success')}</p>}

        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>{t('full_name_label')}</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder={t('contact_name_placeholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('email_address_label')}</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder={t('contact_email_placeholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('contact_message_label')}</label>
            <textarea
              name="message"
              value={message}
              onChange={onChange}
              placeholder={t('contact_message_placeholder')}
              rows="5"
              required
            />
          </div>

          <button type="submit" className="btn">
            {t('contact_submit')}
          </button>
        </form>

        <div className="contact-info">
          <p><strong>{t('contact_info_email')}:</strong> l201027@lhr.nu.edu.pk</p>
          <p><strong>{t('contact_info_response')}:</strong> {t('contact_response_time')}</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
