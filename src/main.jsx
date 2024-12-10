import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.scss'
// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap'
import Home from "./pages/home.jsx";
import Root from "./pages/root.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginCheckProvider } from "./context/login-check-provider.jsx";
import About from "./pages/about.jsx";
import ErrorPage from "./pages/error-page.jsx";
import Login from "./pages/auth/login.jsx";
import { AuthProvider } from "./context/auth-provider.jsx";
import MyStationsOverview from "./pages/my/stations/my-stations-overview.jsx";
import ClaimStation from "./pages/my/stations/claim-station.jsx";
import Register from "./pages/auth/register.jsx";
import StationDetails from "./pages/stations/station-details.jsx";
import EditStation from "./pages/stations/edit-station.jsx";
import AdminDashboard from "./pages/admin/admin-dashboard.jsx";
import WorkshopCodeOverview from "./pages/admin/workshop-codes/workshop-code-overview.jsx";
import CreateWorkshopCode from "./pages/admin/workshop-codes/create-workshop-code.jsx";
import { isAdminLoader } from "./loaders/admin-loader.jsx";
import { isLoggedInUserLoader } from "./loaders/logged-in-user-loader.jsx";
import Logout from "./pages/auth/logout.jsx";
import UserOverview from "./pages/admin/users/user-overview.jsx";
import UserDetails from "./pages/admin/users/user-details.jsx";
import { getUserByIdLoader } from "./loaders/user-loader.jsx";
import ForgotPassword from "./pages/auth/forgot-password.jsx";
import ResetPassword from "./pages/auth/reset-password.jsx";
import Profile from './pages/my/account/profile.jsx';


const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "/map",
                element: <Home />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/auth",
                children: [
                    {
                        path: "login",
                        element: <Login />
                    },
                    {
                        path: "register",
                        element: <Register />
                    },
                    {
                        path: "logout",
                        element: <Logout />
                    },
                    {
                        path: "forgot-password",
                        element: <ForgotPassword />
                    },
                    {
                        path: "reset-password",
                        element: <ResetPassword />
                    }
                ]
            },
            {
                path: "/my",
                loader: isLoggedInUserLoader,
                children: [

                    {
                        path: "/my/account/profile",
                        element: <Profile />
                    },

                    {
                        path: "stations",
                        children: [
                            {
                                index: true,
                                element: <MyStationsOverview />
                            },
                            {
                                path: "claim",
                                element: <ClaimStation />
                            }
                        ]
                    }
                ]
            },
            {
                path: "/stations",
                children: [
                    {
                        path: ":stationId",
                        element: <StationDetails />
                    },
                    {
                        path: ":stationId/edit",
                        element: <EditStation />
                    }
                ]
            },
            {
                path: "/admin",
                loader: isAdminLoader,
                children: [
                    {
                        index: true,
                        element: <AdminDashboard />
                    },
                    {
                        path: "workshop-codes",
                        children: [
                            {
                                index: true,
                                element: <WorkshopCodeOverview />
                            },
                            {
                                path: "create",
                                element: <CreateWorkshopCode />
                            }
                        ]
                    },
                    {
                        path: "users",
                        children: [
                            {
                                index: true,
                                element: <UserOverview />
                            },
                            {
                                path: ":userId",
                                children: [
                                    {
                                        index: true,
                                        element: <UserDetails />,
                                        loader: getUserByIdLoader
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <LoginCheckProvider>
                <RouterProvider router={router} />
            </LoginCheckProvider>
        </AuthProvider>
    </StrictMode>,
)
