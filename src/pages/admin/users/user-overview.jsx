import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonTable} from "../../../components/ui/Skeleton.jsx";
import {Spinner} from "../../../components/ui/Preloader.jsx";
import UserFilters from "../../../components/users/user-filters.jsx";
import FilterButton from "../../../components/filter-button.jsx";
import {Link, useNavigate} from "react-router-dom";
import UserUtils from "../../../utils/user-utils.jsx";

export default function UserOverview() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [errMsg, setErrMsg] = useState(null);
    const [filters, setFilters] = useState({});
    const [filterOpen, setFilterOpen] = useState(false);

    const getAllUsers = async (filters = {}) => {
        setErrMsg(null);
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
                    if (Array.isArray(filters[key])) {
                        if (filters[key].length > 0) {
                            queryParams.append(key, filters[key].join(","));
                        }
                    } else {
                        queryParams.append(key, filters[key]);
                    }
                }
            });

            const response = await backendApi.get(`/users?${queryParams.toString()}`);
            setUsers(response.data);

            if (response.data.length === 0) {
                setErrMsg("Geen gebruikers gevonden");
            }

        } catch (err) {
            let errorMessage = err.message;

            if (err.response?.status === 404) {
                errorMessage = "Geen gebruikers gevonden";
            }

            setErrMsg(errorMessage);
            setUsers([]);
        } finally {
            setLoading(false);
            setReady(true);
        }
    };

    const onFiltersChanged = (filters) => {
        setFilters(filters);
        getAllUsers(filters).then();
    }

    const clearAllFilters = () => {
        setFilters({});
        getAllUsers().then();
    }

    const navigateToDetails = (user) => {
        navigate(`./${user.id}`);
    }

    useEffect(() => {
        getAllUsers().then();
    }, []);

    // Only the very first load blanks the page with a skeleton; later refetches
    // (filter changes) keep the list visible and show a small inline spinner.
    const refetching = ready && loading;

    return (
        <>
            {/* Filter slide-out panel (Tailwind + state; replaces Bootstrap offcanvas) */}
            {filterOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 2xl:hidden" onClick={() => setFilterOpen(false)} role="presentation" />
            )}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-300 2xl:hidden ${filterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h5 className="mb-0 text-lg font-semibold">Filters</h5>
                    <button type="button" onClick={() => setFilterOpen(false)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Sluiten">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="p-4">
                    <UserFilters onFiltersChange={onFiltersChanged} filters={filters}/>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col gap-6 2xl:flex-row">
                    {/* Large screen filters */}
                    <aside className="hidden shrink-0 2xl:block 2xl:w-64">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <i className="bi bi-funnel text-brand-500"></i>
                                Filters
                            </h2>
                            <UserFilters filters={filters} onFiltersChange={onFiltersChanged}
                                         clearAllFilters={clearAllFilters}/>
                        </div>
                    </aside>
                    <section className="w-full min-w-0 2xl:flex-1">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                <i className="bi bi-people text-brand-500"></i>
                                Gebruikers
                            </h1>
                            <div className="flex items-center gap-3">
                                {refetching && (
                                    <span className="flex items-center gap-2 text-sm text-gray-500">
                                        <Spinner className="h-4 w-4" /> bijwerken…
                                    </span>
                                )}
                                <div className="2xl:hidden">
                                    <FilterButton areFiltersActive={Object.keys(filters).length > 0} onClick={() => setFilterOpen(true)}/>
                                </div>
                            </div>
                        </div>

                        {!ready ? (
                            <SkeletonTable rows={6} columns={4}/>
                        ) : users?.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-semibold">Naam</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                                        <th scope="col" className="px-4 py-3 font-semibold">Rol</th>
                                        <th scope="col" className="px-4 py-3"></th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {users.map(user => (
                                        <tr key={user.id} onClick={() => navigateToDetails(user)} className="cursor-pointer transition-colors hover:bg-gray-50">
                                            <td className="px-4 py-3">{`${user.firstName} ${user.lastName}`}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">{UserUtils.translateRole(user.role)}</td>
                                            <td className="px-4 py-3">
                                                <Link to={`./${user.id}`}
                                                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1.5 text-gray-800 transition-colors hover:bg-gray-50"><i
                                                    className="bi bi-arrow-right"></i></Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
                                <i className="bi bi-people text-3xl text-gray-400"></i>
                                <p>{errMsg || "Geen gebruikers gevonden."}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
