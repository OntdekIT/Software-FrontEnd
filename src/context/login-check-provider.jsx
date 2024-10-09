import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { backendApi } from "../utils/backend-api.jsx";

export const LoginCheckContext = createContext(undefined);

export const LoginCheckProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkLogin = async () => {
    try {
      const response = await backendApi.get(`/Authentication/checkLogin`, {
        withCredentials: true
      });
      setIsLoggedIn(response.data);
    } catch (err) {
      console.log(err);
      setIsLoggedIn(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const response = await backendApi.get(`/User/checkAdmin`, {
        withCredentials: true
      });
      setIsAdmin(response.data);
    } catch (err) {
      console.log(err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkLogin();
    checkAdmin();
  }, []);

  return (
      <LoginCheckContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin, checkLogin, checkAdmin }}>
        {children}
      </LoginCheckContext.Provider>
  );
};

LoginCheckProvider.propTypes = {
  children: PropTypes.node,
};