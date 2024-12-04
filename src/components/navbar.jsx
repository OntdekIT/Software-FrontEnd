import { Link } from "react-router-dom";
import { useContext } from "react";
import { LoginCheckContext } from "../context/login-check-provider.jsx";
import UserRole from "../domain/user-role.jsx";

export default function Navbar() {
    const { loggedInUser } = useContext(LoginCheckContext);

    return (
        <nav className="navbar bg-primary navbar-expand-lg justify-content-between fixed-top nav-size shadow-sm">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">MB Ontdekt</a>
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                    aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbar">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/map">Kaart</Link>
                        </li>
                        <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                            <Link className="nav-link" to="/about">Over ons</Link>
                        </li>
                        {loggedInUser ? (
                            <>
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <Link className="nav-link" to="/my/stations">Mijn stations</Link>
                                </li>
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <Link className="nav-link" to="/my/account/profile">Profiel</Link>
                                </li>

                                {(loggedInUser?.role === UserRole.ADMIN || loggedInUser?.role === UserRole.SUPER_ADMIN) && (
                                    <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                        <Link className="nav-link" to="/admin">Beheer</Link>
                                    </li>
                                )}
                                <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse.show">
                                    <Link to={"/auth/logout"} className="nav-link">Uitloggen</Link>
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
