const rawApiBaseUrl =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
export const API_URL = `${API_BASE_URL}/api`;

export const buildAssetUrl = (path = '') => {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
