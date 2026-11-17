import {Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {useAuth} from "../providers/auth-provider.jsx";
import {getVisibleNavItems, isNavItemActive} from "../utils/nav-items.js";

// Colour contrast (WCAG AA, 4.5:1) on the amber bar (#fecb3d): dark text is
// 6.8:1, dark text on the hover colour (brand-600) is 5.1:1, and the active
// item is white on dark (10.3:1). White text on amber is only 1.5:1, so it is not used.
const LINK_BASE = "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark";
const LINK_IDLE = "text-dark hover:bg-brand-600";
const LINK_ACTIVE = "bg-dark text-white";

export default function Navbar() {
    const {loggedInUser} = useAuth();
    const {pathname} = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Escape closes an open menu or dropdown, as people expect from a menu.
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setDropdownOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    const handleNavLinkClick = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    const navItems = getVisibleNavItems(loggedInUser);
    const accountActive = pathname.startsWith("/my/account");

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-brand-500 shadow-md" aria-label="Hoofdnavigatie">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to={"/"} className="flex items-center gap-2 rounded-md text-xl font-semibold text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-dark">
                    <i className="bi bi-house-heart-fill text-2xl" aria-hidden="true"></i>
                    <span>MB Ontdekt</span>
                </Link>

                <button
                    className="inline-flex items-center justify-center rounded-md p-2 text-dark hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark lg:hidden"
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
                    className={`${menuOpen ? "block" : "hidden"} absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto bg-brand-500 px-4 pb-4 shadow-md lg:static lg:flex lg:max-h-none lg:flex-1 lg:items-center lg:justify-between lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none`}
                >
                    <ul className="flex flex-col gap-1 lg:ml-6 lg:flex-row lg:items-center lg:gap-1">
                        {navItems.map((item) => {
                            const active = isNavItemActive(item, pathname);
                            return (
                                <li key={item.to}>
                                    <Link
                                        className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                                        to={item.to}
                                        aria-current={active ? "page" : undefined}
                                        onClick={handleNavLinkClick}
                                    >
                                        <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <ul className="mt-2 flex flex-col gap-1 lg:mt-0 lg:ml-auto lg:flex-row lg:items-center lg:gap-2">
                        {loggedInUser ? (
                            <li className="relative">
                                <button
                                    type="button"
                                    id="userDropdown"
                                    data-cy="user-dropdown"
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="true"
                                    onClick={() => setDropdownOpen((open) => !open)}
                                    className={`${LINK_BASE} w-full lg:w-auto ${accountActive ? LINK_ACTIVE : LINK_IDLE}`}
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
                                              aria-current={accountActive ? "page" : undefined}
                                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>
                                            <i className="bi bi-person-circle" aria-hidden="true"></i>
                                            <span>Mijn profiel</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={"/auth/logout"} data-cy="logout-link"
                                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                              onClick={handleNavLinkClick}>
                                            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                                            <span>Uitloggen</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li>
                                <Link
                                    className={`${LINK_BASE} ${pathname.startsWith("/auth/login") ? LINK_ACTIVE : LINK_IDLE}`}
                                    to="/auth/login"
                                    data-testid="LoginButton"
                                    aria-current={pathname.startsWith("/auth/login") ? "page" : undefined}
                                    onClick={handleNavLinkClick}
                                >
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
