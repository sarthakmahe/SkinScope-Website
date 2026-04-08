import { LOGIN_SUCCESS, LOGIN_FAIL, USER_LOADED, AUTH_ERROR, LOGOUT, REGISTER_SUCCESS, REGISTER_FAIL } from './types';
import { setAlert } from './alertActions';
import setAuthToken from '../utils/setAuthToken';
import getStoredToken from '../utils/getStoredToken';
import api from '../utils/api';

// Load User
export const loadUser = () => async dispatch => {
  const token = getStoredToken();

  if (token) {
    setAuthToken(token);
  } else {
    localStorage.removeItem('token');
    setAuthToken(null);
    dispatch({
      type: AUTH_ERROR
    });
    return;
  }

  try {
    const res = await api.get('/auth');

    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      (typeof err?.response?.data === 'string' ? err.response.data : null) ||
      err?.message ||
      'Authentication error';
    dispatch(setAlert(msg, 'danger'));
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register User
export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await api.post('/users', body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err?.response?.data?.errors;

    if (Array.isArray(errors) && errors.length) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    } else {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Registration failed';
      dispatch(setAlert(msg, 'danger'));
    }

    dispatch({
      type: REGISTER_FAIL
    });
  }
};

// Login User
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await api.post('/auth', body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err?.response?.data?.errors;

    if (Array.isArray(errors) && errors.length) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    } else {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Login failed';
      dispatch(setAlert(msg, 'danger'));
    }

    dispatch({
      type: LOGIN_FAIL
    });
  }
};

// Logout User
export const logout = () => dispatch => {
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
  setAuthToken(null);
  dispatch({ type: LOGOUT });
};
