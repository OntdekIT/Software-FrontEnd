import {useContext} from "react";
import {AuthContext} from "../context/auth-provider.jsx";

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;