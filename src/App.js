import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import About from "./Components/About";
import ErrorPage from "./Components/ErrorPage";
import FormSignup from "./Components/FormSignup";
import RegisterStation from "./Components/RegisterStation";
import Unauthorized from "./Components/Unauthorized";
import Admin from "./Components/Admin";
import EditStation from "./Pages/EditStation";
import StationsTable from "./Components/StationsTable";
import Layout from "./Components/Layout";
import PersistLogin from "./Components/PersistLogin";
import RequireAuth from "./Components/RequireAuth";
import NavBar from "./Components/NavBar";
import Account from "./Components/Account";
import Station from "./Components/Station";
import UserDetails from "./Components/UserDetails";

const ROLES = {
  User: 2001,
  Admin: 5150,
};

function App() {
  return (
    <>
      <NavBar> </NavBar>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="About" element={<About />} />
          <Route path="Login" element={<Login />} />
          <Route path="Signup" element={<FormSignup />} />
          <Route path="/Edit/:stationId" element={<EditStation />} />
          <Route path="Unauthorized" element={<Unauthorized />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/Station/:id" element={<Station />} />

          <Route path="Userdetails" element={<UserDetails />} />

          {/* we want to protect these routes */}
          <Route path="Stations" element={<StationsTable />} />
          <Route path="Register" element={<RegisterStation />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route element={<PersistLogin />}>
              <Route path="Admin" element={<Admin />} />
            </Route>
          </Route>

          {/* catch all , 404 page*/}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
