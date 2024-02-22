import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import About from "./Pages/About";
import ErrorPage from "./Pages/ErrorPage";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";
import EditStation from "./Pages/EditStation";
import Layout from "./Components/Layout";
import Account from "./Pages/Account";
import UserDetails from "./Pages/UserDetails";
import RegisterStationCode from "./Pages/RegisterStationCode";
function Router() {
    return (
        <Routes>
            <Route className="container" path="/" element={<Layout />}>
                {/* public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/About" element={<About />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Unauthorized" element={<Unauthorized />} />
                <Route path="/Account" element={<Account />} />

                {/* we want to protect these routes */}
                <Route path="/Userdetails" element={<UserDetails />} />
                <Route path="/Station/Create" element={<RegisterStationCode />} />
                <Route path="/Station/Edit:id" element={<EditStation />} />

                {/* catch all , 404 page*/}
                <Route path="*" element={<ErrorPage />} />
            </Route>
        </Routes>
    )
}

export default Router