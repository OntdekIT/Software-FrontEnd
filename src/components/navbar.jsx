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

    const navLinkClass = "block rounded-md px-3 py-2 text-white/90 transition-colors hover:bg-brand-600 hover:text-white";

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-brand-500 shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to={"/"} className="text-xl font-semibold text-white">MB Ontdekt</Link>

                <button
                    className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
                    type="button"
                    aria-controls="navbarToggler"
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <i className="bi bi-list text-2xl"></i>
                </button>

                <div
                    id="navbarToggler"
                    className={`${menuOpen ? "block" : "hidden"} absolute left-0 right-0 top-16 bg-brand-500 px-4 pb-4 shadow-sm lg:static lg:flex lg:flex-1 lg:items-center lg:justify-between lg:bg-transparent lg:p-0 lg:shadow-none`}
                >
                    <ul className="flex flex-col gap-1 lg:ml-6 lg:flex-row lg:items-center lg:gap-2">
                        <li>
                            <Link className={navLinkClass} to="/newheatmap" onClick={handleNavLinkClick}>Heatmap</Link>
                        </li>

                        <li>
                            <Link className={navLinkClass} to="/wijken" onClick={handleNavLinkClick}>Wijken</Link>
                        </li>

                        <li>
                            <Link className={navLinkClass} to="/about" onClick={handleNavLinkClick}>Over ons</Link>
                        </li>
                        {loggedInUser && (
                            <li>
                                <Link className={navLinkClass} to="/my/stations" onClick={handleNavLinkClick}>Mijn stations</Link>
                            </li>
                        )}
                        {(loggedInUser?.role === UserRole.ADMIN || loggedInUser?.role === UserRole.SUPER_ADMIN) && (
                            <li>
                                <Link className={navLinkClass} to="/admin" onClick={handleNavLinkClick}>Beheer</Link>
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
                                    className="flex w-full items-center gap-1 rounded-md px-3 py-2 text-white/90 transition-colors hover:bg-brand-600 hover:text-white lg:w-auto"
                                >
                                    {loggedInUser.firstName} {loggedInUser.lastName}
                                    <i className="bi bi-caret-down-fill text-xs"></i>
                                </button>
                                <ul
                                    aria-labelledby="userDropdown"
                                    className={`${dropdownOpen ? "block" : "hidden"} mt-1 min-w-[12rem] rounded-lg bg-white py-1 shadow-lg lg:absolute lg:right-0 lg:mt-2`}
                                >
                                    <li>
                                        <Link to={"/my/account"} data-cy="account-link"
                                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>Mijn profiel</Link>
                                    </li>
                                    <li>
                                        <Link to={"/auth/logout"} data-cy="logout-link"
                                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>Uitloggen</Link>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li>
                                <Link className={navLinkClass} to="/auth/login" data-testid="LoginButton" onClick={handleNavLinkClick}>Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
