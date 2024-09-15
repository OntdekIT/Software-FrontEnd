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
import ClaimStation from "./Pages/ClaimStation";
import CreateWorkshopCode from "./Pages/CreateWorkshopCode";
import ShowWorkshopCode from "./Pages/ShowWorkshopCode";
import AdminPage from './Pages/AdminPage';
import GrantUserAdmin from './Pages/GrantUserAdmin';
import { LoginCheckProvider } from './Components/LoginCheck';
import InfoStation from "./Pages/InfoStation";

function Router() {
    return (
        <LoginCheckProvider>
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
                {/* <Route path="/Userdetails" element={<UserDetails />} /> */}
                {/*<Route path="/Station/Create" element={<ClaimStation />} />*/}
                <Route path="/Station/Edit" element={<EditStation />} />
                <Route path="/Station/Info" element={<InfoStation />} />
                <Route path="/Station/Claim" element={<ClaimStation />} />

                {/* admin routes */}
                <Route path="/Admin" element={<AdminPage />} />
                <Route path="/Admin/grantUserAdmin" element={<GrantUserAdmin />} />
                <Route path="/Admin/workshopcode/create" element={<CreateWorkshopCode />} />
                <Route path="/Admin/workshopcode/show" element={<ShowWorkshopCode />} />



                {/* catch all , 404 page*/}
                <Route path="*" element={<ErrorPage />} />
            </Route>
            </Routes>
        </LoginCheckProvider>
    )
}

export default Router