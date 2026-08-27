/**
 * Global API Base URL resolution for Cropling Platform:
 * 1. Uses import.meta.env.VITE_API_BASE_URL if explicitly configured in Netlify / .env
 * 2. Falls back to http://localhost:5000 when running on a local development server (localhost / 127.0.0.1)
 * 3. Automatically connects to the live production Render backend (https://smart-crop-advisory-platform.onrender.com) when deployed.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  return 'https://smart-crop-advisory-platform.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
