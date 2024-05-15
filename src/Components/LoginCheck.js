import React, { createContext, useState, useEffect } from "react";
import { api } from "../App";

const LoginCheck = createContext();

export const LoginCheckProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null);
    const CHECKLOGIN_URL = '/Authentication/checkLogin';

  const checkLogin = async () => {
    console.log("Navbar test 1: ");
    try{
      const response = await api.get(
          CHECKLOGIN_URL,
          {
            withCredentials: true
          });
      setIsLoggedIn(response.data);
    }
    catch(err){
      console.log(err);
    }
  }

  const checkAdmin = async () => {
    try {
      const response = await api.get(
        '/User/checkAdmin',
          {
            withCredentials: true
          });
      setIsAdmin(response.data);
    } 
    catch(err){
      console.log(err);
    }
};

  useEffect(() => {
    checkLogin();
    checkAdmin();
  }, []);
  
    return (
      <LoginCheck.Provider value={{ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }}>
        {children}
      </LoginCheck.Provider>
    );
  };
  
  export default LoginCheck;