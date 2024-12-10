import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import {useAuth} from "../providers/auth-provider.jsx";
import {jwtDecode} from "jwt-decode";

export default function useTokenExpirationCheck() {
    const {token, updateToken, setLoggedInUser} = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (token) {
            const isTokenExpired = (token) => {
                try {
                    const decodedToken = jwtDecode(token);
                    return decodedToken.exp * 1000 < Date.now();
                } catch (error) {
                    console.error("Failed to decode token:", error);
                    return true;
                }
            };

            if (isTokenExpired(token)) {
                console.log("Token is expired. Removing from localStorage.");
                localStorage.removeItem("token");
                localStorage.removeItem("loggedInUser");
                updateToken(null);
            }
        }
    }, [location, token, updateToken, setLoggedInUser]);
}