import {createContext, useEffect, useState} from "react";
import PropTypes from 'prop-types';
import {backendApi} from "../utils/backend-api.jsx";

export const LoginCheckContext = createContext(undefined);

export const LoginCheckProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null);

  const checkLogin = async () => {
    console.log("Navbar test 1: ");
    try {
      const response = await backendApi.get(`/Authentication/checkLogin`,
          {
            withCredentials: true
          });
      setIsLoggedIn(response.data);
      console.log("test login 1");
    } catch (err) {
      console.log(err);
    }
  }

  const checkAdmin = async () => {
    try {
      const response = await backendApi.get(`/User/checkAdmin`,
          {
            withCredentials: true
          });
      setIsAdmin(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkLogin();
    checkAdmin();
  }, []);

  return (
      <LoginCheckContext.Provider value={{isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin}}>
        {children}
      </LoginCheckContext.Provider>
  );
}

LoginCheckProvider.propTypes = {
  children: PropTypes.node,
};