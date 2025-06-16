const SessionStorage = {
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  },
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  },
};

export default SessionStorage; 