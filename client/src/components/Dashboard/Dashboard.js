import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useLanguage } from '../../context/LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="dashboard-container">
      <h2>{t('dashboard_title')}</h2>
      <div className="dashboard-links">
        <Link to="/profile" className="dashboard-link">{t('nav_profile')}</Link>
        <Link to="/records" className="dashboard-link">{t('nav_records')}</Link>
        <Link to="/predict" className="dashboard-link">{t('nav_predict')}</Link>
      </div>
    </div>
  );
};

export default Dashboard;
