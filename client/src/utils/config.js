const getDefaultApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const { hostname, origin, protocol, port } = window.location;
  const isLocalClient =
    (hostname === 'localhost' || hostname === '127.0.0.1') && port === '3000';

  if (isLocalClient) {
    return `${protocol}//${hostname}:5000`;
  }

  return origin;
};

const rawApiBaseUrl = getDefaultApiBaseUrl();

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
