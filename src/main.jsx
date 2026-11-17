import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from "./pages/root.jsx";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AuthProvider from "./providers/auth-provider.jsx";
import ProtectedRoute from "./components/protected-route.jsx";
import UserRole from "./domain/user-role.jsx";
import { getUserByIdLoader } from "./loaders/user-loader.jsx";
import Preloader from "./components/ui/Preloader.jsx";
import { ToastProvider } from "./components/ui/toast.jsx";
import LegacyRedirect from "./components/legacy-redirect.jsx";
import { LEGACY_PARAM_REDIRECTS, LEGACY_REDIRECTS } from "./utils/legacy-routes.js";

// Lazy load everything
const Kaart = lazy(() => import('./pages/kaart.jsx'));
const Heatmap = lazy(() => import('./pages/heatmap.jsx'));
const Wijken = lazy(() => import('./pages/wijken.jsx'));
const Notifications = lazy(() => import('./pages/notifications.jsx'));
const About = lazy(() => import('./pages/about.jsx'));
const Login = lazy(() => import('./pages/auth/login.jsx'));
const Register = lazy(() => import('./pages/auth/register.jsx'));
const Logout = lazy(() => import('./pages/auth/logout.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/forgot-password.jsx'));
const ResetPassword = lazy(() => import('./pages/auth/reset-password.jsx'));
const MyStationsOverview = lazy(() => import('./pages/my/stations/my-stations-overview.jsx'));
const ClaimStation = lazy(() => import('./pages/my/stations/claim-station.jsx'));
const Profile = lazy(() => import('./pages/my/account/profile.jsx'));
const StationDetails = lazy(() => import('./pages/stations/station-details.jsx'));
const EditStation = lazy(() => import('./pages/stations/edit-station.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/admin-layout.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/admin-dashboard.jsx'));
const WorkshopCodeOverview = lazy(() => import('./pages/admin/workshop-codes/workshop-code-overview.jsx'));
const CreateWorkshopCode = lazy(() => import('./pages/admin/workshop-codes/create-workshop-code.jsx'));
const UserOverview = lazy(() => import('./pages/admin/users/user-overview.jsx'));
const UserDetails = lazy(() => import('./pages/admin/users/user-details.jsx'));
const StationOverview = lazy(() => import('./pages/admin/stations/stations-overview.jsx'));
const MeetstationToevoegen = lazy(() => import('./pages/admin/stations/toevoegen/meetstation-toevoegen.jsx'));
const DataCoverage = lazy(() => import('./pages/admin/data-coverage/data-coverage.jsx'));
const ComingSoon = lazy(() => import('./pages/coming-soon.jsx'));
const ErrorPage = lazy(() => import('./pages/error-page.jsx'));

// Oude routes sturen door naar de kaart (zie utils/legacy-routes.js).
const legacyRoutes = [
    ...Object.entries(LEGACY_REDIRECTS).map(([path, to]) => ({
        path,
        element: <Navigate to={to} replace />
    })),
    ...Object.entries(LEGACY_PARAM_REDIRECTS).map(([path, to]) => ({
        path,
        element: <LegacyRedirect to={to} />
    })),
];

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                // De kaart is het hoofdscherm. /wijk/:id is dezelfde pagina met het
                // detailsheet open; als kinderroutes zodat de kaart niet opnieuw
                // laadt bij het wisselen tussen wijken.
                path: "/",
                element: <Suspense fallback={<Preloader />}><Kaart /></Suspense>,
                children: [
                    { index: true },
                    { path: "wijk/:id" }
                ]
            },
            {
                path: "/heatmap",
                element: <Suspense fallback={<Preloader />}><Heatmap /></Suspense>
            },
            {
                path: "/wijken",
                element: <Suspense fallback={<Preloader />}><Wijken /></Suspense>
            },
            ...legacyRoutes,
            // Tijdelijk: de pagina-PR's (#184 tot #186) vervangen deze drie routes.
            ...['dashboard'].map((path) => ({
                path,
                element: <Suspense fallback={<Preloader />}><ComingSoon /></Suspense>
            })),
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
                path: "/meldingen",
                element: <ProtectedRoute />,
                children: [
                    { index: true, element: <Suspense fallback={<Preloader />}><Notifications /></Suspense> }
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
                children: [{
                    // Beheer as one screen with tabs: the layout shows the tab
                    // bar, the old routes below keep working and open their tab.
                    element: <Suspense fallback={<Preloader />}><AdminLayout /></Suspense>,
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
                        { path: "data-coverage", element: <Suspense fallback={<Preloader />}><DataCoverage /></Suspense> },
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
                }]
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