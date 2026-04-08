import Chatbot from './components/chatbot/chatbot';
import React, { useEffect } from 'react';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from './store';
import { loadUser } from './actions/authActions';
import setAuthToken from './utils/setAuthToken';
import getStoredToken from './utils/getStoredToken';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import Profile from './components/Dashboard/Profile';
import Records from './components/Dashboard/Records';
import Predict from './components/Predictions/Predict';
import About from './components/About/About';
import Blog from './components/Blog/Blog';
import Contact from './components/Contact/Contact';
import Dashboard from './components/Dashboard/Dashboard';
import BlogPostForm from './components/Blog/BlogPostForm';
import PrivateRoute from './components/routing/PrivateRoute';
import { LanguageProvider } from './context/LanguageContext';

import './App.css';


const storedToken = getStoredToken();

if (storedToken) {
  setAuthToken(storedToken);
} else {
  localStorage.removeItem('token');
  setAuthToken(null);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute component={Profile} />} />
              <Route path="/records" element={<PrivateRoute component={Records} />} />
              <Route path="/predict" element={<PrivateRoute component={Predict} />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
              <Route path="/create-blog" element={<PrivateRoute component={BlogPostForm} />} />
              <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
