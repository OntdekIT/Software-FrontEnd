import {useAuth} from "../../providers/auth-provider.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export default function Logout() {
    const navigate = useNavigate();
    const {updateToken} = useAuth();

    const handleLogout = () => {
        updateToken(null);
        navigate("/auth/login");
    };

    useEffect(() => {
        handleLogout();
        // Run once on mount; adding handleLogout would re-run the logout every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<div>Aan het uitloggen...</div>);
}