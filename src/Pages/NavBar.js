import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="app">
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Ontdekstation013
          </a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  {" "}
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  {" "}
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Signup">
                  {" "}
                  Signup
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Register">
                  {" "}
                  Register
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Account">
                  {" "}
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
