import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import About from "./Pages/About";
import ErrorPage from "./Pages/ErrorPage";
import FormSignup from "./Pages/FormSignup";
import Register from "./Pages/RegisterStation";
import NavBar from "./Pages/NavBar";

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
      </Routes>
    </>
  );
}

export default App;
