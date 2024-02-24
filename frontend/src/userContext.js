import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Retrieve user information from localStorage on initial load
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const loginUser = (username) => {
    setUser({ username });

    // Save user information to localStorage
    localStorage.setItem('user', JSON.stringify({ username }));
  };

  const logoutUser = () => {
    setUser(null);

    // Remove user information from localStorage
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Optionally perform any additional initialization or checks here
    // This effect runs once when the component mounts
  }, []);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
