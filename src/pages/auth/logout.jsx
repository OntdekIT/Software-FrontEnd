import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LoginCheckContext } from "../../context/login-check-provider.jsx";
import { backendApi } from "../../utils/backend-api.jsx";
import useAuth from "../../hooks/use-auth.jsx";


export default function Logout() {
    const { checkLogin } = useContext(LoginCheckContext);
    const { setAuth } = useAuth();

    useEffect(() => {
        const logout = async () => {
            try {
                localStorage.removeItem("stationId");
                await backendApi.post('/authentication/logout', {
                    withCredentials: true
                });

                setAuth(null); // Clear authentication state
                await checkLogin();


            } catch (err) {
                console.log("Error logging out: ");
                console.log(err);
            }
        };

        logout();
    }, [setAuth]);

    return (
        <div className="container">
            <div className="row">
                <div className="col text-center">
                    <h1 className="page-header-margin">Succesvol uitgelogd</h1>
                    <p>Druk op de knop hieronder om terug naar de homepagina te gaan</p>
                    <Link to="/" className="btn btn-primary">Home</Link>
                </div>
            </div>
        </div>
    );
}