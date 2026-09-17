import {Link} from "react-router-dom";
import UserRole from "../domain/user-role.jsx";
import {useAuth} from "../providers/auth-provider.jsx";
import {useState} from "react";

export default function Navbar() {
    const {loggedInUser} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleNavLinkClick = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    const navLinkClass = "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-brand-600 hover:text-white";
    const isAdmin = loggedInUser?.role === UserRole.ADMIN || loggedInUser?.role === UserRole.SUPER_ADMIN;

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-brand-500 shadow-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to={"/"} className="flex items-center gap-2 text-xl font-semibold text-dark">
                    <i className="bi bi-house-heart-fill text-2xl" aria-hidden="true"></i>
                    <span>MB Ontdekt</span>
                </Link>

                <button
                    className="inline-flex items-center justify-center rounded-md p-2 text-dark hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
                    type="button"
                    aria-controls="navbarToggler"
                    aria-expanded={menuOpen}
                    aria-label="Navigatie in-/uitklappen"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} text-2xl`} aria-hidden="true"></i>
                </button>

                <div
                    id="navbarToggler"
                    className={`${menuOpen ? "block" : "hidden"} absolute left-0 right-0 top-16 bg-brand-500 px-4 pb-4 shadow-md lg:static lg:flex lg:flex-1 lg:items-center lg:justify-between lg:bg-transparent lg:p-0 lg:shadow-none`}
                >
                    <ul className="flex flex-col gap-1 lg:ml-6 lg:flex-row lg:items-center lg:gap-1">
                        <li>
                            <Link className={navLinkClass} to="/newheatmap" onClick={handleNavLinkClick}>
                                <i className="bi bi-map" aria-hidden="true"></i>
                                <span>Heatmap</span>
                            </Link>
                        </li>

                        <li>
                            <Link className={navLinkClass} to="/wijken" onClick={handleNavLinkClick}>
                                <i className="bi bi-geo-alt" aria-hidden="true"></i>
                                <span>Wijken</span>
                            </Link>
                        </li>

                        <li>
                            <Link className={navLinkClass} to="/about" onClick={handleNavLinkClick}>
                                <i className="bi bi-info-circle" aria-hidden="true"></i>
                                <span>Over ons</span>
                            </Link>
                        </li>
                        {loggedInUser && (
                            <li>
                                <Link className={navLinkClass} to="/my/stations" onClick={handleNavLinkClick}>
                                    <i className="bi bi-broadcast" aria-hidden="true"></i>
                                    <span>Mijn stations</span>
                                </Link>
                            </li>
                        )}
                        {isAdmin && (
                            <li>
                                <Link className={navLinkClass} to="/admin" onClick={handleNavLinkClick}>
                                    <i className="bi bi-gear" aria-hidden="true"></i>
                                    <span>Beheer</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                    <ul className="mt-2 flex flex-col gap-1 lg:mt-0 lg:ml-auto lg:flex-row lg:items-center lg:gap-2">
                        {loggedInUser ? (
                            <li className="relative">
                                <button
                                    type="button"
                                    id="userDropdown"
                                    data-cy="user-dropdown"
                                    aria-expanded={dropdownOpen}
                                    onClick={() => setDropdownOpen((open) => !open)}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-brand-600 hover:text-white lg:w-auto"
                                >
                                    <i className="bi bi-person-circle text-lg" aria-hidden="true"></i>
                                    <span>{loggedInUser.firstName} {loggedInUser.lastName}</span>
                                    <i className={`bi bi-caret-down-fill text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`} aria-hidden="true"></i>
                                </button>
                                <ul
                                    aria-labelledby="userDropdown"
                                    className={`${dropdownOpen ? "block" : "hidden"} mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg lg:absolute lg:right-0 lg:mt-2`}
                                >
                                    <li>
                                        <Link to={"/my/account"} data-cy="account-link"
                                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>
                                            <i className="bi bi-person-circle" aria-hidden="true"></i>
                                            <span>Mijn profiel</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={"/auth/logout"} data-cy="logout-link"
                                              className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>
                                            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                                            <span>Uitloggen</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li>
                                <Link className={navLinkClass} to="/auth/login" data-testid="LoginButton" onClick={handleNavLinkClick}>
                                    <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                                    <span>Login</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
