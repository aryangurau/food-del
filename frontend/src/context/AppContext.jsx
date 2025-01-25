import { createContext, useState, useContext, useEffect } from 'react';

export const AppContext = createContext();

const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    primary: '#4a90e2',
    secondary: '#f5f5f5',
    accent: '#ff6b6b'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#4a90e2',
    secondary: '#2d2d2d',
    accent: '#ff6b6b'
  }
};

const languages = {
  en: {
    name: 'English',
    translations: {
      home: 'Home',
      menu: 'Menu',
      offers: 'Offers',
      wishlist: 'Wishlist',
      profile: 'Profile',
      loyalty: 'Loyalty Points',
      settings: 'Settings'
    }
  },
  ne: {
    name: 'नेपाली',
    translations: {
      home: 'गृह',
      menu: 'मेनु',
      offers: 'अफरहरू',
      wishlist: 'इच्छा सूची',
      profile: 'प्रोफाइल',
      loyalty: 'लोयल्टी पोइन्ट्स',
      settings: 'सेटिङहरू'
    }
  }
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const savedLoyaltyPoints = parseInt(localStorage.getItem('loyaltyPoints')) || 0;
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setWishlist(savedWishlist);
    setLoyaltyPoints(savedLoyaltyPoints);
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    localStorage.setItem('loyaltyPoints', loyaltyPoints.toString());
  }, [theme, language, wishlist, loyaltyPoints]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lang) => {
    if (languages[lang]) {
      setLanguage(lang);
    }
  };

  const addToWishlist = (item) => {
    setWishlist(prev => {
      if (!prev.some(i => i.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist(prev => prev.filter(item => item.id !== itemId));
  };

  const addLoyaltyPoints = (points) => {
    setLoyaltyPoints(prev => prev + points);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      theme: themes[theme],
      currentTheme: theme,
      toggleTheme,
      language: languages[language].translations,
      currentLanguage: language,
      changeLanguage,
      languages,
      loyaltyPoints,
      addLoyaltyPoints,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      notifications,
      addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
