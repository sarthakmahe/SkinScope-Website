import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { t } = useLanguage();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const primaryCta = isAuthenticated
    ? { to: '/dashboard', label: t('home_primary_authenticated') }
    : { to: '/login', label: t('home_primary_guest') };

  const insights = [
    t('home_insight_1'),
    t('home_insight_2'),
    t('home_insight_3')
  ];

  const features = [
    {
      title: t('home_feature_1_title'),
      description: t('home_feature_1_desc')
    },
    {
      title: t('home_feature_2_title'),
      description: t('home_feature_2_desc')
    },
    {
      title: t('home_feature_3_title'),
      description: t('home_feature_3_desc')
    }
  ];

  const journey = [
    t('home_step_1'),
    t('home_step_2'),
    t('home_step_3')
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker">{t('home_kicker')}</span>
          <h1>{t('home_title')}</h1>
          <p>{t('home_description')}</p>
          <div className="home-hero-actions">
            <Link to={primaryCta.to} className="home-btn home-btn-primary">
              {primaryCta.label}
            </Link>
            <Link to="/about" className="home-btn home-btn-secondary">
              {t('home_secondary_cta')}
            </Link>
          </div>
          <div className="home-insights">
            {insights.map((insight) => (
              <div key={insight} className="home-insight-card">
                {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="signal-card signal-card-primary">
            <span>{t('home_signal_title')}</span>
            <strong>{t('home_signal_value')}</strong>
            <p>{t('home_signal_text')}</p>
          </div>
          <div className="signal-card signal-card-secondary">
            <span>{t('home_signal_support_title')}</span>
            <strong>{t('home_signal_support_value')}</strong>
            <p>{t('home_signal_support_text')}</p>
          </div>
          <div className="scan-orbit scan-orbit-one" />
          <div className="scan-orbit scan-orbit-two" />
          <div className="scan-core">
            <div className="scan-core-ring" />
            <div className="scan-core-ring scan-core-ring-delayed" />
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <span>{t('home_features_eyebrow')}</span>
          <h2>{t('home_features_title')}</h2>
        </div>
        <div className="home-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="home-feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section-journey">
        <div className="home-section-heading">
          <span>{t('home_journey_eyebrow')}</span>
          <h2>{t('home_journey_title')}</h2>
        </div>
        <div className="home-journey-grid">
          {journey.map((step, index) => (
            <div key={step} className="home-journey-card">
              <span className="home-step-number">0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta-band">
        <div>
          <span>{t('home_cta_eyebrow')}</span>
          <h2>{t('home_cta_title')}</h2>
          <p>{t('home_cta_text')}</p>
        </div>
        <div className="home-cta-links">
          <Link to={isAuthenticated ? '/predict' : '/register'} className="home-btn home-btn-primary">
            {isAuthenticated ? t('home_cta_predict') : t('home_cta_register')}
          </Link>
          <Link to="/blog" className="home-btn home-btn-secondary">
            {t('home_cta_blog')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
