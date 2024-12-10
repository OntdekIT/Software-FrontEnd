import {createContext, useContext, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {backendApi} from "../utils/backend-api.jsx";

const AuthContext = createContext(null);

export default function AuthProvider({children}) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));

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
    }, [token]);

    const contextValue = useMemo(() => ({
        token,
        updateToken,
        loggedInUser,
        refreshUserInfo
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