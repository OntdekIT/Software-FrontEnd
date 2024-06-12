import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Menu } from '../Assets/menu.svg';
import {api} from "../App";
import Cookies from 'js-cookie';
import LoginCheckContext from "./LoginCheck";

const CHECKLOGIN_URL = '/Authentication/checkLogin';
const LOGOUT_URL = '/Authentication/logout';

const NavBar = () => {
  const { isLoggedIn, isAdmin } = useContext(LoginCheckContext);
  const logout = async () => {
    try {
      const response = await api.delete(
          LOGOUT_URL,
          {
            withCredentials: true
          });
    }
    catch(err){
      console.log(err);
    }

    window.location.href = "http://localhost:3000/";
  }

  useEffect(() => {
  }, []);

  return (
      <header className="navbar-section">
        <nav className="navbar navbar-expand-lg justify-content-between">
          {/* Brand */}
          <a className="navbar-brand" href="/">MB Ontdekt</a>

          {/* Collapse button */}
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar"
                  aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
            <Menu className="navbar-toggler-icon" />
          </button>

          {/* Collapsible content */}
          <div className="collapse navbar-collapse justify-content-end" id="navbar">
            {/* Container for links */}
            <ul className="navbar-nav mr-auto">
              {/* Links */}
              <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                <Link className="nav-link" to="/about">Over ons</Link>
              </li>
              {isLoggedIn ? (
                  <>
                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" to="/Account">Mijn stations</Link>
                    </li>
                    {/* <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" to="/Userdetails">Mijn gegevens</Link>
                    </li> */}
                    {isAdmin && (
                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" to="/admin">Admin Page</Link>
                    </li>
                    )}
                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" onClick={logout}>Uitloggen</Link>
                    </li>
                  </>
              ) : (
                  <>
                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                  </>
              )}
            </ul>
          </div>
        </nav>
      </header>
  );
}

export default NavBar;
