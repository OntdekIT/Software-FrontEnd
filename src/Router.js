import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import About from "./Pages/About";
import ErrorPage from "./Pages/ErrorPage";
import Register from "./Pages/Register";
import RegisterStation from "./Components/RegisterStation";
import Unauthorized from "./Pages/Unauthorized";
import Admin from "./Pages/Admin";
import StationsTable from "./Pages/StationsTable";
import EditStation from "./Pages/EditStation";
import Layout from "./Components/Layout";
import PersistLogin from "./Components/PersistLogin";
import RequireAuth from "./Components/RequireAuth";
import NavBar from "./Components/NavBar";
import Account from "./Pages/Account";
import Station from "./Pages/Station";
import UserDetails from "./Pages/UserDetails";
import Verify from "./Pages/Verify"
import RegisterStationCode from "./Pages/RegisterStationCode";
import RegisterStationName from "./Pages/RegisterStationName";
import RegisterStationHeight from "./Pages/RegisterStationHeight";
import RegisterStationData from "./Pages/RegisterStationData";
import RegisterStationVisibility from "./Pages/RegisterStationVisibility";

const ROLES = {
    User: 2001,
    Admin: 5150,
};

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
                <Route path="/Verify/:linkHash/:email" element={<Verify />} />

                {/* we want to protect these routes */}
                <Route path="/Userdetails" element={<UserDetails />} />
                <Route path="/Station/:id" element={<Station />} />
                <Route path="/Station/Create" element={<RegisterStationCode />} />
                <Route path="/Station/Create/Name" element={<RegisterStationName />} />
                <Route path="/Station/Create/Height" element={<RegisterStationHeight />} />
                <Route path="/Station/Create/Data" element={<RegisterStationData />} />
                <Route path="/Station/Create/Visibility" element={<RegisterStationVisibility />} />
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
    )
}

export default Router