import { API_BASE_URL } from '../../services/api/config.js';

/**
 * Returns a fully qualified media URL.
 * In local development, it automatically prepends the backend base URL to relative paths starting with /uploads/.
 * In production, if served from the same domain, a relative path is fine, but this handles prepending if needed.
 * @param {string} path - The media path stored in DB (e.g. '/uploads/images/test.png')
 * @returns {string} - The fully qualified URL
 */
export const getMediaUrl = (path) => {
  if (!path || typeof path !== 'string') return 'https://via.placeholder.com/40';

  // If it's already a full URL, return it directly
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }

  // Handle local relative paths
  if (path.startsWith('/uploads/')) {
    // API_BASE_URL is typically 'http://localhost:5000/api' or 'https://api.yourdomain.com/api/v1'
    try {
      if (API_BASE_URL && API_BASE_URL.startsWith('http')) {
        const baseUrl = new URL(API_BASE_URL);
        return `${baseUrl.origin}${path}`;
      }
      throw new Error('Relative API base');
    } catch (e) {
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
           return `http://localhost:5000${path}`;
        }
      }
      return path; 
    }
  }

  return path;
};
