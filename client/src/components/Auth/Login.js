import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../actions/authActions';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translateMessage } from '../../utils/translateMessage';
import './Auth.css';

const Login = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const alerts = useSelector(state => state.alert);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="auth-container">
      <h2>{t('login_title')}</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-group">
          <label>{t('email_label')}</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{t('password_label')}</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" className="btn">{t('login_button')}</button>
      </form>
      {alerts && alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
          {translateMessage(alert.msg, t)}
        </div>
      ))}
    </div>
  );
};

export default Login;
