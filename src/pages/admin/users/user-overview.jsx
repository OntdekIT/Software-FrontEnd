import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonTable} from "../../../components/ui/Skeleton.jsx";
import UserFilters from "../../../components/users/user-filters.jsx";
import FilterButton from "../../../components/filter-button.jsx";
import {Link, useNavigate} from "react-router-dom";
import UserUtils from "../../../utils/user-utils.jsx";

export default function UserOverview() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
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
        }
    };

    const onFiltersChanged = (filters) => {
        setFilters(filters);
        console.log(filters);

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
            <header className="toolbar fixed-top flex items-center justify-end 2xl:hidden">
                <FilterButton areFiltersActive={Object.keys(filters).length > 0} onClick={() => setFilterOpen(true)}/>
            </header>
            <main className="w-full px-4">
                <div className="flex flex-col 2xl:flex-row">
                    {/* Large screen filters */}
                    <aside className="full-height-sidebar hidden shadow-sm 2xl:block 2xl:w-1/6 2xl:border-r 2xl:border-gray-200 2xl:pr-4">
                        <h2>Filters</h2>
                        <UserFilters filters={filters} onFiltersChange={onFiltersChanged}
                                     clearAllFilters={clearAllFilters}/>
                    </aside>
                    <section className="w-full 2xl:w-5/6 2xl:pl-4">
                        <div className="nav-size block 2xl:hidden"></div>
                        <h1 className="page-header-margin text-center">Gebruikers</h1>
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        {loading && (
                            <SkeletonTable rows={6} columns={4}/>
                        )}
                        {!loading && (users?.length > 0) && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                    <tr className="border-b border-gray-200 text-sm text-gray-500">
                                        <th scope="col" className="px-3 py-2 font-medium">Naam</th>
                                        <th scope="col" className="px-3 py-2 font-medium">Email</th>
                                        <th scope="col" className="px-3 py-2 font-medium">Rol</th>
                                        <th scope="col" className="px-3 py-2 font-medium"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users && users.map(user => (
                                        <tr key={user.id} onClick={() => navigateToDetails(user)} className="cursor-pointer border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-3 py-2">{`${user.firstName} ${user.lastName}`}</td>
                                            <td className="px-3 py-2">{user.email}</td>
                                            <td className="px-3 py-2">{UserUtils.translateRole(user.role)}</td>
                                            <td className="px-3 py-2">
                                                <Link to={`./${user.id}`}
                                                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1 text-sm text-gray-800 hover:bg-gray-50"><i
                                                    className="bi bi-arrow-right"></i></Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
