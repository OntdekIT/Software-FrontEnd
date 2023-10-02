import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        // check to see if there is a user, so logged in or not
        //check foreach existing role if it is the same as the allowedRole/userrole
        auth?.roles?.find(role => allowedRoles?.includes(role))
            ? <Outlet />
            : auth?.user
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                //navigate to login, cause user does not exist/not logged in from current position
                //state... makes it possible to go to previous page, so important
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;