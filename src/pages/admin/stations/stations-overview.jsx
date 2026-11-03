import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonTable} from "../../../components/ui/Skeleton.jsx";
import {Spinner} from "../../../components/ui/Preloader.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import StationFilters from "../../../components/stations/station-filters.jsx"
import MeetstationForm from "../../../components/stations/meetstation-form.jsx";
import {Link, useNavigate} from "react-router-dom";

export default function StationOverview() {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [errMsg, setErrMsg] = useState(null);
    const [filters, setFilters] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);

    const getAllStations = async (filters = {}) => {
        setErrMsg(null);
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await backendApi.get(`/Meetstation/stations?${queryParams.toString()}`, { 
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });
            
            const stationsData = response.data;

            // Fetch users to resolve owner names. /api/users is paginated
            // (Spring Page); request a large page so every station owner is
            // covered, and read the page's content array.
            const userResponse = await backendApi.get(`/users?page=0&pageSize=100`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });

            const users = userResponse.data.content ?? [];

            // Map usernames to stations
            const updatedStations = stationsData.map(station => {
                const user = users.find(u => u.id === station.userid);
                return { ...station, username: user ? `${user.firstName} ${user.lastName}` : 'Geen gebruiker' };
            });
            
            setStations(updatedStations);

            if (response.data.length === 0) {
                setErrMsg("Geen stations gevonden");
            }
        } catch (err) {
            setErrMsg(err.response?.data?.message || err.message || "Fout bij het ophalen van stations.");

            setStations([]);
        } finally {
            setLoading(false);
            setReady(true);
        }
    };

    const onFiltersChanged = (filters) => {
        setFilters(filters);
        getAllStations(filters);
    }

    const clearAllFilters = () => {
        setFilters({});
        getAllStations();
    }

    const navigateToDetails = (station) => {
        navigate(`./${station.stationid}`);
    }

    useEffect(() => {
        getAllStations();
    }, []);

    // Only the very first load blanks the page with a skeleton; later refetches
    // (filter changes) keep the table visible and show a small inline spinner.
    const refetching = ready && loading;

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col gap-6 2xl:flex-row">
                    <aside className="hidden shrink-0 2xl:block 2xl:w-64">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <i className="bi bi-funnel text-brand-500"></i>
                                Filters
                            </h2>
                            <StationFilters filters={filters} onFiltersChange={onFiltersChanged} clearAllFilters={clearAllFilters}/>
                        </div>
                    </aside>
                    <section className="w-full min-w-0 2xl:flex-1">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                                <i className="bi bi-broadcast text-brand-500"></i>
                                Meetstations
                            </h1>
                            <div className="flex items-center gap-3">
                                {refetching && (
                                    <span className="flex items-center gap-2 text-sm text-gray-500">
                                        <Spinner className="h-4 w-4" /> bijwerken…
                                    </span>
                                )}
                                <Button variant="primary" size="md" onClick={() => setShowAddModal(true)}>
                                    <i className="bi bi-plus-lg"></i>
                                    Voeg Meetstation Toe
                                </Button>
                            </div>
                        </div>
                        {errMsg && ready && stations.length > 0 && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700">{errMsg}</div>
                        )}
                        {!ready ? (
                            <SkeletonTable rows={6} columns={6}/>
                        ) : stations.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Naam</th>
                                        <th className="px-4 py-3 font-semibold">Gebruiker</th>
                                        <th className="px-4 py-3 font-semibold">Actief</th>
                                        <th className="px-4 py-3 font-semibold">Publiek</th>
                                        <th className="px-4 py-3 font-semibold">Database Tag</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {stations.map(station => (
                                        <tr
                                            key={station.stationid}
                                            onClick={() => navigateToDetails(station)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">{station.name}</td>
                                            <td className="px-4 py-3">{station.username ? `${station.username} (${station.userid})` : `Geen gebruiker (${station.userid || 'Geen ID'})`}</td>
                                            <td className="px-4 py-3">{station.isActive ? 'Ja' : 'Nee'}</td>
                                            <td className="px-4 py-3">{station.is_public ? 'Ja' : 'Nee'}</td>
                                            <td className="px-4 py-3">{station.database_tag}</td>
                                            <td className="px-4 py-3">
                                                <Link className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2.5 py-1.5 text-gray-800 transition-colors hover:bg-gray-50">
                                                    <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
                                <i className="bi bi-broadcast text-3xl text-gray-400"></i>
                                <p>{errMsg || "Geen stations gevonden."}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <Modal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Nieuw Meetstation Toevoegen"
            >
                <MeetstationForm
                    onSuccess={() => {
                        setShowAddModal(false);
                        getAllStations(filters);
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </>
    );
}