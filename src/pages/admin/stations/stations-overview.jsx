import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonTable} from "../../../components/ui/Skeleton.jsx";
import StationFilters from "../../../components/stations/station-filters.jsx"
import {Link, useNavigate} from "react-router-dom";

export default function StationOverview() {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [filters, setFilters] = useState({});

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
            
            // Fetch usernames for each station userId
            const userIds = stationsData.map(station => station.userid).filter(id => id != null);
            const userResponse = await backendApi.get(`/users?ids=${userIds.join(',')}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });
            
            const users = userResponse.data;
            
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

    return (
        <>
            <main className="mx-auto w-full px-4">
                <div className="flex flex-col gap-6 xl:flex-row">
                    <aside className="hidden w-full shrink-0 border-r border-gray-200 pr-4 shadow-sm 2xl:block 2xl:w-1/6">
                        <h2 className="mb-3 text-xl font-semibold">Filters</h2>
                        <StationFilters filters={filters} onFiltersChange={onFiltersChanged} clearAllFilters={clearAllFilters}/>
                    </aside>
                    <section className="w-full 2xl:w-5/6">
                        <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                            <h1 className="text-center text-2xl font-bold">Meetstations</h1>
                            <Link
                                to="/admin/stations/toevoegen"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                            >
                                Voeg Meetstation Toe
                            </Link>
                        </div>
                        {errMsg && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700">{errMsg}</div>}
                        {loading ? <SkeletonTable rows={6} columns={6}/> : (
                            stations.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
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
                            ) : <div className="text-gray-600">Geen stations gevonden.</div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}