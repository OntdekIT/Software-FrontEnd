import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import About from "./Components/About";
import ErrorPage from "./Components/ErrorPage";
import Register from "./Components/Register";
import RegisterStation from "./Components/RegisterStation";
import Unauthorized from "./Components/Unauthorized";
import Admin from "./Components/Admin";
import StationsTable from "./Components/StationsTable";
import EditStation from "./Components/EditStation";
import Layout from "./Components/Layout";
import PersistLogin from "./Components/PersistLogin";
import RequireAuth from "./Components/RequireAuth";
import NavBar from "./Components/NavBar";
import Account from "./Components/Account";
import Station from "./Components/Station";
import UserDetails from "./Components/UserDetails";
import Verify from "./Components/Verify"

const ROLES = {
  User: 2001,
  Admin: 5150,
};

function App() {
  return (
    <>
      <NavBar></NavBar>
      <Routes>
        <Route className="container" path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="About" element={<About />} />
          <Route path="Login" element={<Login />} />
          <Route path="Register" element={<Register />} />
          <Route path="Unauthorized" element={<Unauthorized />} />
          <Route path="/Account" element={<Account />} />
          <Route path="/Verify/:linkHash/:email" element={<Verify />} />

          {/* we want to protect these routes */}
          <Route path="Userdetails" element={<UserDetails />} />
          <Route path="/Station/:id" element={<Station />} />
          <Route path="/Station/Create" element={<RegisterStation />} />
          <Route path="/Station/Edit:id" element={<EditStation />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route element={<PersistLogin />}>
              <Route path="Admin" element={<Admin />} />
              <Route path="Stations" element={<StationsTable />} />
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
