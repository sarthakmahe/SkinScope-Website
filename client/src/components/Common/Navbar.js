import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions/authActions';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';
import logo from '../../images/logo.jpg'; // Updated import path

const Navbar = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    dispatch(logout());
  };

  const guestLinks = (
    <>
      <Link to="/login">{t('nav_login')}</Link>
      <Link to="/register">{t('nav_register')}</Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard">{t('nav_dashboard')}</Link>
      <Link to="/profile">{t('nav_profile')}</Link>
      <Link to="/records">{t('nav_records')}</Link>
      <Link to="/predict">{t('nav_predict')}</Link>
      {auth.user && auth.user.role === 'admin' && (
        <Link to="/create-blog">{t('nav_create_blog')}</Link>
      )}
      <Link to="/" onClick={handleLogout}>{t('nav_logout')}</Link>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="navbar-brand-mark">
            <img src={logo} alt="SkinScope Logo" className="navbar-logo" />
          </span>
          <span className="navbar-brand-copy">
            <span className="navbar-brand-name">SkinScope</span>
            <span className="navbar-brand-tagline">{t('nav_brand_tagline')}</span>
          </span>
        </Link>
      </div>
      <div className="navbar-actions">
        <div className="navbar-links">
          <Link to="/">{t('nav_home')}</Link>
          <Link to="/about">{t('nav_about')}</Link>
          <Link to="/blog">{t('nav_blog')}</Link>
          <Link to="/contact">{t('nav_contact')}</Link>
          {auth.isAuthenticated ? authLinks : guestLinks}
        </div>
        <div className="language-switcher" aria-label={t('nav_language')}>
          <button
            type="button"
            className={`language-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`language-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
          >
            HI
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
