import {createContext, useContext, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {backendApi} from "../utils/backend-api.jsx";

const AuthContext = createContext(null);

// Safely read a JSON value from localStorage. A corrupt/non-JSON entry must
// not crash the whole app on mount, so fall back to null and clear it.
function readStoredUser() {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem("loggedInUser");
        return null;
    }
}

export default function AuthProvider({children}) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loggedInUser, setLoggedInUser] = useState(readStoredUser);

    const updateToken = (newToken) => {
        setToken(newToken);
    }

    const refreshUserInfo = async () => {
        if (token) {
            try {
                const response = await backendApi.get("/my-account");
                setLoggedInUser(response.data);
                localStorage.setItem("loggedInUser", JSON.stringify(response.data));
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                setLoggedInUser(null);
                localStorage.removeItem("loggedInUser");
            }
        }
    }

    useEffect(() => {
        if (token) {
            backendApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
            refreshUserInfo().then();
        } else {
            delete backendApi.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
            setLoggedInUser(null);
            localStorage.removeItem("loggedInUser");
        }
        // Only react to token changes; refreshUserInfo is stable and including
        // it would re-run this auth side-effect unnecessarily.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const contextValue = useMemo(() => ({
        token,
        updateToken,
        loggedInUser,
        refreshUserInfo
        // refreshUserInfo is a stable reference; memo only needs to change on
        // token/loggedInUser.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [token, loggedInUser]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}