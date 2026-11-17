import {Link, Outlet, useLocation} from "react-router-dom";
import {ADMIN_TABS, getActiveAdminTab} from "../../utils/admin-tabs.js";

// One Beheer screen: a tab bar on top and the matching admin page below. The
// pages keep their own routes and headings, the layout only adds the tabs.
// The tab bar scrolls sideways on narrow screens instead of wrapping.
export default function AdminLayout() {
    const {pathname} = useLocation();
    const active = getActiveAdminTab(pathname);

    return (
        <div>
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 pt-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <i className="bi bi-gear text-brand-700" aria-hidden="true"></i>
                        Beheer
                    </p>
                    <nav aria-label="Beheer" data-cy="admin-tabs" className="-mb-px mt-2 overflow-x-auto">
                        <ul className="flex min-w-max gap-1">
                            {ADMIN_TABS.map((tab) => {
                                const isActive = active?.key === tab.key;
                                return (
                                    <li key={tab.key}>
                                        <Link
                                            to={tab.to}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dark ${isActive ? "border-dark text-dark" : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900"}`}
                                        >
                                            <i className={`bi ${tab.icon}`} aria-hidden="true"></i>
                                            <span>{tab.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
            <Outlet/>
        </div>
    );
}
