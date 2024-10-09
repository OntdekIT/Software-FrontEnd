import {createContext, useState} from "react";
import PropTypes from "prop-types";

const AuthContext = createContext({});

//the children represent the components that are nested inside the authprovider
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({}); //contains empty object

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;