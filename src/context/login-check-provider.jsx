import {createContext, useEffect, useState} from "react";
import PropTypes from 'prop-types';
import {backendApi} from "../utils/backend-api.jsx";

export const LoginCheckContext = createContext(undefined);

export const LoginCheckProvider = ({children}) => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    const checkLoggedInUser = async () => {
        try {
            const response = await backendApi.get(`/my-account`, {
                withCredentials: true
            });
            setLoggedInUser(response.data);
        } catch (err) {
            console.log(err);
            setLoggedInUser(false);
        }
    };

    useEffect(() => {
        checkLoggedInUser().then();
    }, []);

    return (
        <LoginCheckContext.Provider
            value={{loggedInUser, checkLogin: checkLoggedInUser}}>
            {children}
        </LoginCheckContext.Provider>
    );
};

LoginCheckProvider.propTypes = {
    children: PropTypes.node,
};