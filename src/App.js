import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import About from "./Pages/About";
import ErrorPage from "./Pages/ErrorPage";
import FormSignup from "./Pages/FormSignup";
import Register from "./Pages/RegisterStation";
import NavBar from "./Pages/NavBar";
import Account from "./Pages/Account";
import Station from "./Pages/Station"

function App() {
  return (
    <>
      <NavBar> </NavBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Login" element={<Login />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/Signup" element={<FormSignup />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/Station/:id" element={<Station />}/>
      </Routes>
    </>
  );
}

export default App;
