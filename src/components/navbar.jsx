import {Link, useLocation} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../providers/auth-provider.jsx";
import {PROFILE_ITEM, getMenuItems, getProfileMenuItems, getTopBarItems, isNavItemActive} from "../utils/nav-items.js";

// Top bar. On desktop it holds the brand, at most four items and the profile
// menu. Below the `lg` breakpoint only the brand stays, the bottom bar
// (bottom-bar.jsx) takes over the navigation.
//
// Colour contrast (WCAG AA, 4.5:1) on the amber bar (#fecb3d): dark text is
// 6.8:1, dark text on the hover colour (brand-600) is 5.1:1, and the active
// item is white on dark (10.3:1). White text on amber is only 1.5:1, so it is not used.
const LINK_BASE = "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark";
const LINK_IDLE = "text-dark hover:bg-brand-600";
const LINK_ACTIVE = "bg-dark text-white";
const MENU_LINK = "flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:bg-gray-100";

export default function Navbar() {
    const {loggedInUser} = useAuth();
    const {pathname} = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef(null);

    // Escape or a click outside closes an open menu, as people expect.
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setDropdownOpen(false);
            }
        };
        const onPointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onPointerDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onPointerDown);
        };
    }, []);

    const closeMenu = () => setDropdownOpen(false);

    const topItems = getTopBarItems(loggedInUser);
    const menuItems = getProfileMenuItems(loggedInUser);
    // Guests get no dropdown: Over ons is a plain link next to Login.
    const guestLinks = loggedInUser ? [] : getMenuItems(null);
    const profileActive = isNavItemActive(PROFILE_ITEM, pathname) || menuItems.some((item) => isNavItemActive(item, pathname));

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-brand-500 shadow-md" aria-label="Hoofdnavigatie">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to={"/"} className="flex items-center gap-2 rounded-md text-xl font-semibold text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-dark">
                    <i className="bi bi-house-heart-fill text-2xl" aria-hidden="true"></i>
                    <span>MB Ontdekt</span>
                </Link>

                <ul className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
                    {topItems.map((item) => {
                        const active = isNavItemActive(item, pathname);
                        return (
                            <li key={item.to}>
                                <Link
                                    className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                                    to={item.to}
                                    aria-current={active ? "page" : undefined}
                                >
                                    <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <ul className="hidden items-center gap-2 lg:flex">
                    {guestLinks.map((item) => {
                        const active = isNavItemActive(item, pathname);
                        return (
                            <li key={item.to}>
                                <Link
                                    className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                                    to={item.to}
                                    aria-current={active ? "page" : undefined}
                                >
                                    <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                    {!loggedInUser && (
                        <li>
                            <Link
                                className={`${LINK_BASE} ${pathname.startsWith("/auth/login") ? LINK_ACTIVE : LINK_IDLE}`}
                                to="/auth/login"
                                data-testid="LoginButton"
                                aria-current={pathname.startsWith("/auth/login") ? "page" : undefined}
                            >
                                <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                                <span>Login</span>
                            </Link>
                        </li>
                    )}
                    {loggedInUser && <li className="relative" ref={menuRef}>
                        <button
                            type="button"
                            id="userDropdown"
                            data-cy="user-dropdown"
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                            aria-controls="userDropdownMenu"
                            onClick={() => setDropdownOpen((open) => !open)}
                            className={`${LINK_BASE} ${profileActive ? LINK_ACTIVE : LINK_IDLE}`}
                        >
                            <i className="bi bi-person-circle text-lg" aria-hidden="true"></i>
                            <span>{`${loggedInUser.firstName} ${loggedInUser.lastName}`}</span>
                            <i className={`bi bi-caret-down-fill text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`} aria-hidden="true"></i>
                        </button>
                        <ul
                            id="userDropdownMenu"
                            aria-labelledby="userDropdown"
                            className={`${dropdownOpen ? "block" : "hidden"} absolute right-0 mt-2 min-w-[13rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg`}
                        >
                            {loggedInUser && (
                                <li>
                                    <Link to={PROFILE_ITEM.to} data-cy="account-link"
                                          aria-current={pathname.startsWith(PROFILE_ITEM.to) ? "page" : undefined}
                                          className={MENU_LINK} onClick={closeMenu}>
                                        <i className="bi bi-person-circle" aria-hidden="true"></i>
                                        <span>Mijn profiel</span>
                                    </Link>
                                </li>
                            )}
                            {menuItems.map((item) => (
                                <li key={item.to}>
                                    <Link to={item.to}
                                          aria-current={isNavItemActive(item, pathname) ? "page" : undefined}
                                          className={MENU_LINK} onClick={closeMenu}>
                                        <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                            {loggedInUser && (
                                <li className="mt-1 border-t border-gray-200 pt-1">
                                    <Link to={"/auth/logout"} data-cy="logout-link"
                                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-gray-100 focus:outline-none focus-visible:bg-gray-100"
                                          onClick={closeMenu}>
                                        <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                                        <span>Uitloggen</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </li>}
                </ul>
            </div>
        </nav>
    );
}
