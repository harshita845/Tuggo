import { useState, useEffect } from 'react';
import defaultLogo from '@/assets/logo.png';

/**
 * Hook to get the dynamic app logo for the specific application (user, admin, restaurant, delivery)
 * @param {'user_app' | 'admin_app' | 'restaurant_app' | 'delivery_app'} appType 
 * @returns {string} The URL of the logo to use
 */
export function useAppLogo(appType = 'user_app') {
  const [logo, setLogo] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedLogo = localStorage.getItem(`${appType}_logo`);
      return storedLogo || defaultLogo;
    }
    return defaultLogo;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handler to check for logo updates
    const handleThemeUpdate = () => {
      const storedLogo = localStorage.getItem(`${appType}_logo`);
      if (storedLogo && storedLogo !== logo) {
        setLogo(storedLogo);
      }
    };

    // Initial check just in case
    handleThemeUpdate();

    // Listen for custom themeLoaded event dispatched by themeSettings.js
    window.addEventListener('themeLoaded', handleThemeUpdate);
    
    // Also listen to storage events in case it changes in another tab
    window.addEventListener('storage', handleThemeUpdate);

    return () => {
      window.removeEventListener('themeLoaded', handleThemeUpdate);
      window.removeEventListener('storage', handleThemeUpdate);
    };
  }, [appType, logo]);

  return logo;
}
