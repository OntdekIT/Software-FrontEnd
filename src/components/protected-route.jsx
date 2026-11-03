import {useAuth} from "../providers/auth-provider.jsx";
import {Navigate, Outlet} from "react-router-dom";
import PropTypes from "prop-types";

export default function ProtectedRoute({roles = []}) {
    const {token, loggedInUser} = useAuth();

    if (!token) {
        console.log("User is not authenticated. Redirecting to /login.");
        return <Navigate to="/auth/login" />;
    }

    if (roles.length > 0 && !roles.includes(loggedInUser?.role)) {
        console.log("User is not authorized to access this route.");
        throw { status: 403, message: "Forbidden" };  // Throw an error for the router to catch
    }

    return <Outlet />;
}

ProtectedRoute.propTypes = {
    roles: PropTypes.array
};
