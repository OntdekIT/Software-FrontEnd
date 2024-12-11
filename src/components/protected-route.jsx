import {useAuth} from "../providers/auth-provider.jsx";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";
import ErrorPage from "../pages/error-page.jsx";

export default function ProtectedRoute({roles = []}) {
    const {token, loggedInUser} = useAuth();

    if (!token) {
        console.log("User is not authenticated. Redirecting to /login.");
        return <Navigate to="/auth/login" />;
    }

    if (roles.length > 0 && !roles.includes(loggedInUser?.role)) {
        console.log("User is not authorized to access this route. Redirecting to error page");
        return <ErrorPage title={"Verboden toegang"} message={"U bent niet gemachtigd om deze pagina te bekijken."} />;
    }

    return <Outlet />;
}

ProtectedRoute.propTypes = {
    roles: PropTypes.array
};