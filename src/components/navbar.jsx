import {Link} from "react-router-dom";
import {useContext, useEffect} from "react";
import {LoginCheckContext} from "../context/login-check-provider.jsx";
import {backendApi} from "../utils/backend-api.jsx";

export default function Navbar() {
    const {checkLogin, checkAdmin, isLoggedIn, isAdmin} = useContext(LoginCheckContext);
    const logout = async () => {
        try {
            localStorage.removeItem("stationId");
            await backendApi.delete('/Authentication/logout',
                {
                    withCredentials: true
                });

            checkLogin();
            checkAdmin();

        } catch (err) {
            console.log(err);
        }

        window.location.href = "http://localhost:5173/";

    }

    useEffect(() => {
    }, []);

    return (
        <nav className="navbar bg-primary navbar-expand-lg justify-content-between fixed-top nav-size shadow-sm">
            <div className="container-fluid">
                {/* Brand */}
                <a className="navbar-brand" href="/">MB Ontdekt</a>

                {/* Collapse button */}
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbar"
                        aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"/>
                </button>

                {/* Collapsible content */}
                <div className="collapse navbar-collapse justify-content-end" id="navbar">
                    {/* Container for links */}
                    <ul className="navbar-nav mr-auto">
                        {/* Links */}
                        <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/map">Kaart</Link>
                        </li>
                        <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/about">Over ons</Link>
                        </li>
                        {isLoggedIn ? (
                            <>
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <Link className="nav-link" to="/my/stations">Mijn stations</Link>
                                </li>
                                {/* <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                      <Link className="nav-link" to="/Userdetails">Mijn gegevens</Link>
                    </li> */}
                                {isAdmin && (
                                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                        <Link className="nav-link" to="/admin">Beheer</Link>
                                    </li>
                                )}
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <a className="nav-link" onClick={logout}>Uitloggen</a>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <Link className="nav-link" to="/auth/login">Login</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}