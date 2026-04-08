import React from 'react';
import './About.css';
import { useLanguage } from '../../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="about-container">
      <div className="about-header">
        <h2>{t('about_title')}</h2>
        <p>{t('about_desc')}</p>
      </div>

      <div className="about-mission">
        <h3>{t('mission_title')}</h3>
        <p>{t('mission_desc')}</p>
      </div>

      <h3 className="team-title">{t('team_title')}</h3>

      <div className="about-team">
        <div className="team-card">
          <img src="/images/defaultuser.jpeg" alt="Nikita" />
          <h4>Nikita Yadav</h4>
        </div>

        <div className="team-card">
          <img src="/images/defaultuser.jpeg" alt="Sarthak" />
          <h4>Sarthak Maheshwari</h4>
        </div>

        <div className="team-card">
          <img src="/images/defaultuser.jpeg" alt="Hemant" />
          <h4>Hemant Verma</h4>
        </div>
      </div>
    </div>
  );
};

export default About;
