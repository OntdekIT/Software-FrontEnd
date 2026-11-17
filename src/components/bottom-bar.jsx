import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../providers/auth-provider.jsx";
import {getBottomBarItems, isNavItemActive} from "../utils/nav-items.js";

// Bottom bar for narrow screens (hidden from the `lg` breakpoint, where the top
// bar takes over). Contrast (WCAG AA): dark text on the amber bar is 6.8:1 and
// the active item is white on dark (10.3:1). The bar adds the device's bottom
// safe area as padding, and Root reserves the same height under the page so
// the bar never covers content.
export default function BottomBar() {
    const {loggedInUser} = useAuth();
    const {pathname} = useLocation();
    const items = getBottomBarItems(loggedInUser);

    return (
        <nav
            aria-label="Hoofdnavigatie mobiel"
            data-cy="bottom-bar"
            className="fixed bottom-0 left-0 right-0 z-40 bg-brand-500 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.15)] lg:hidden"
        >
            <ul className="mx-auto flex h-16 max-w-xl items-stretch gap-1 px-2 py-1.5">
                {items.map((item) => {
                    const active = isNavItemActive(item, pathname);
                    return (
                        <li key={item.to} className="flex-1">
                            <Link
                                to={item.to}
                                aria-current={active ? "page" : undefined}
                                className={`flex h-full flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark ${active ? "bg-dark text-white" : "text-dark hover:bg-brand-600"}`}
                            >
                                <i className={`bi ${item.icon} text-xl leading-none`} aria-hidden="true"></i>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
