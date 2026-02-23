import {Link} from "react-router-dom";
import UserRole from "../domain/user-role.jsx";
import {useAuth} from "../providers/auth-provider.jsx";
import {useRef} from "react";
import {Collapse} from "bootstrap";

export default function Navbar() {
    const {loggedInUser} = useAuth();
    const navbarCollapseRef = useRef(null);
    const navbarTogglerRef = useRef(null);

    const handleNavLinkClick = () => {
        if (navbarTogglerRef.current && window.getComputedStyle(navbarTogglerRef.current).display !== 'none') {
            if (navbarCollapseRef.current) {
                const bsCollapse = new Collapse(navbarCollapseRef.current);
                bsCollapse.hide();
            }
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-primary fixed-top nav-size shadow-sm">
            <div className="container-fluid">
                <Link to={"/"} className="navbar-brand">MB Ontdekt</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false"
                        aria-label="Toggle navigation" ref={navbarTogglerRef}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarToggler" ref={navbarCollapseRef}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/newheatmap" onClick={handleNavLinkClick}>Heatmap</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about" onClick={handleNavLinkClick}>Over ons</Link>
                        </li>
                        {loggedInUser && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/my/stations" onClick={handleNavLinkClick}>Mijn stations</Link>
                            </li>
                        )}
                        {(loggedInUser?.role === UserRole.ADMIN || loggedInUser?.role === UserRole.SUPER_ADMIN) && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin" onClick={handleNavLinkClick}>Beheer</Link>
                            </li>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {loggedInUser ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                   data-bs-toggle="dropdown" data-cy="user-dropdown" aria-expanded="false">
                                    {loggedInUser.firstName} {loggedInUser.lastName}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" data-bs-theme="light"
                                    aria-labelledby="userDropdown">
                                    <li><Link to={"/my/account"} data-cy="account-link"
                                              className="dropdown-item" onClick={handleNavLinkClick}>Mijn profiel</Link></li>
                                    <li><Link to={"/auth/logout"} data-cy="logout-link"
                                              className="dropdown-item" onClick={handleNavLinkClick}>Uitloggen</Link></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/auth/login" data-testid="LoginButton" onClick={handleNavLinkClick}>Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}