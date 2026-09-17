import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from "./pages/root.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider from "./providers/auth-provider.jsx";
import ProtectedRoute from "./components/protected-route.jsx";
import UserRole from "./domain/user-role.jsx";
import { getUserByIdLoader } from "./loaders/user-loader.jsx";
import Preloader from "./components/ui/Preloader.jsx";
import { ToastProvider } from "./components/ui/toast.jsx";

// Lazy load everything
const NewHome = lazy(() => import('./pages/new-home.jsx'));
const NewHeatMap = lazy(() => import('./pages/new-heatmap.jsx'));
const About = lazy(() => import('./pages/about.jsx'));
const Login = lazy(() => import('./pages/auth/login.jsx'));
const Register = lazy(() => import('./pages/auth/register.jsx'));
const Logout = lazy(() => import('./pages/auth/logout.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/forgot-password.jsx'));
const ResetPassword = lazy(() => import('./pages/auth/reset-password.jsx'));
const MyStationsOverview = lazy(() => import('./pages/my/stations/my-stations-overview.jsx'));
const ClaimStation = lazy(() => import('./pages/my/stations/claim-station.jsx'));
const Profile = lazy(() => import('./pages/my/account/profile.jsx'));
const StationsList = lazy(() => import('./pages/stations/stations-list.jsx'));
const StationDetails = lazy(() => import('./pages/stations/station-details.jsx'));
const EditStation = lazy(() => import('./pages/stations/edit-station.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/admin-dashboard.jsx'));
const WorkshopCodeOverview = lazy(() => import('./pages/admin/workshop-codes/workshop-code-overview.jsx'));
const CreateWorkshopCode = lazy(() => import('./pages/admin/workshop-codes/create-workshop-code.jsx'));
const UserOverview = lazy(() => import('./pages/admin/users/user-overview.jsx'));
const UserDetails = lazy(() => import('./pages/admin/users/user-details.jsx'));
const StationOverview = lazy(() => import('./pages/admin/stations/stations-overview.jsx'));
const MeetstationToevoegen = lazy(() => import('./pages/admin/stations/toevoegen/meetstation-toevoegen.jsx'));
const ErrorPage = lazy(() => import('./pages/error-page.jsx'));
const NeighbourhoodPage = lazy(() => import('./pages/neighbourhoodPage.jsx'));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Suspense fallback={<Preloader />}><NewHome /></Suspense>
            },
            {
                path: "/newhome",
                element: <Suspense fallback={<Preloader />}><NewHome /></Suspense>
            },
            {
                path: "/newheatmap",
                element: <Suspense fallback={<Preloader />}><NewHeatMap /></Suspense>
            },
            {
                path: "/wijken",
                element: <Suspense fallback={<Preloader />}><NeighbourhoodPage /></Suspense>
            },
            {
                path: "/wijken/:id",
                element: <Suspense fallback={<Preloader />}><NeighbourhoodPage /></Suspense>
            },
            {
                path: "/about",
                element: <Suspense fallback={<Preloader />}><About /></Suspense>
            },
            {
                path: "/auth",
                children: [
                    { path: "login", element: <Suspense fallback={<Preloader />}><Login /></Suspense> },
                    { path: "register", element: <Suspense fallback={<Preloader />}><Register /></Suspense> },
                    { path: "logout", element: <Suspense fallback={<Preloader />}><Logout /></Suspense> },
                    { path: "forgot-password", element: <Suspense fallback={<Preloader />}><ForgotPassword /></Suspense> },
                    { path: "reset-password", element: <Suspense fallback={<Preloader />}><ResetPassword /></Suspense> }
                ]
            },
            {
                path: "/my",
                element: <ProtectedRoute />,
                children: [
                    { path: "/my/account", element: <Suspense fallback={<Preloader />}><Profile /></Suspense> },
                    {
                        path: "stations",
                        children: [
                            { index: true, element: <Suspense fallback={<Preloader />}><MyStationsOverview /></Suspense> },
                            { path: "claim", element: <Suspense fallback={<Preloader />}><ClaimStation /></Suspense> }
                        ]
                    }
                ]
            },
            {
                path: "/stations",
                children: [
                    { index: true, element: <Suspense fallback={<Preloader />}><StationsList /></Suspense> },
                    {
                        path: ":stationId",
                        element: <Suspense fallback={<Preloader />}><StationDetails /></Suspense>,
                        // edit is nested so StationDetails stays mounted underneath and
                        // the edit modal renders via <Outlet/> as a real overlay.
                        children: [
                            { path: "edit", element: <Suspense fallback={<Preloader />}><EditStation /></Suspense> }
                        ]
                    }
                ]
            },
            {
                path: "/admin",
                element: <ProtectedRoute roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} />,
                children: [
                    { index: true, element: <Suspense fallback={<Preloader />}><AdminDashboard /></Suspense> },
                    {
                        path: "workshop-codes",
                        children: [
                            { index: true, element: <Suspense fallback={<Preloader />}><WorkshopCodeOverview /></Suspense> },
                            { path: "create", element: <Suspense fallback={<Preloader />}><CreateWorkshopCode /></Suspense> }
                        ]
                    },
                    {
                        path: "users",
                        children: [
                            { index: true, element: <Suspense fallback={<Preloader />}><UserOverview /></Suspense> },
                            {
                                path: ":userId",
                                children: [
                                    { index: true, element: <Suspense fallback={<Preloader />}><UserDetails /></Suspense>, loader: getUserByIdLoader }
                                ]
                            }
                        ]
                    },
                    {
                        path: "stations",
                        children: [
                            { index: true, element: <Suspense fallback={<Preloader />}><StationOverview /></Suspense> },
                            { path: "toevoegen", element: <Suspense fallback={<Preloader />}><MeetstationToevoegen /></Suspense> },
                            {
                                path: ":stationId",
                                children: [
                                    { index: true, element: <Suspense fallback={<Preloader />}><StationDetails /></Suspense> }
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
        <ToastProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </ToastProvider>
    </StrictMode>,
)