import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import About from "./Pages/About";
import NotFoundErrorPage from "./Pages/Errors/NotFoundErrorPage";
import Register from "./Pages/Register";
import UnauthorizedErrorPage from "./Pages/Errors/UnauthorizedErrorPage";
import EditStation from "./Pages/EditStation";
import Layout from "./Components/Layout";
import Account from "./Pages/Account";
import ClaimStation from "./Pages/ClaimStation";
import CreateWorkshopCode from "./Pages/CreateWorkshopCode";
import ShowWorkshopCode from "./Pages/ShowWorkshopCode";
import AdminPage from './Pages/Admin/AdminPage';
import GrantUserAdmin from './Pages/Admin/GrantUserAdmin';
import { LoginCheckProvider } from './Components/LoginCheck';
import InfoStation from "./Pages/InfoStation";

function Router() {
    return (
        <LoginCheckProvider>
            <Routes>
            <Route className="container" path="/" element={<Layout />}>
                {/* public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/errors/unauthorized" element={<UnauthorizedErrorPage />} />
                <Route path="/errors/not-found" element={<NotFoundErrorPage />} />
                <Route path="/account" element={<Account />} />
                {/* we want to protect these routes */}
                {/* <Route path="/userdetails" element={<UserDetails />} /> */}
                {/*<Route path="/stations/create" element={<ClaimStation />} />*/}
                <Route path="/stations/edit" element={<EditStation />} />
                <Route path="/stations/info" element={<InfoStation />} />
                <Route path="/stations/claim" element={<ClaimStation />} />

                {/* admin routes */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/grantUserAdmin" element={<GrantUserAdmin />} />
                <Route path="/admin/workshop-codes/create" element={<CreateWorkshopCode />} />
                <Route path="/admin/workshop-codes" element={<ShowWorkshopCode />} />



                {/* catch all , 404 page*/}
                <Route path="*" element={<NotFoundErrorPage />} />
            </Route>
            </Routes>
        </LoginCheckProvider>
    )
}

export default Router