import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import LoadingComponent from "../../../components/loading-component.jsx";
import StationFilters from "../../../components/stations/station-filters.jsx"
import {Link, useNavigate} from "react-router-dom";

export default function StationOverview() {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [filters, setFilters] = useState({});

    const handleClick = () => {
        navigate('/admin/stations/add');
    };

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
            <div className="offcanvas offcanvas-start" tabIndex="-1" id="stationFilterOffcanvas">
                <div className="offcanvas-header">
                    <h5>Filters</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div className="offcanvas-body">
                    <StationFilters onFiltersChange={onFiltersChanged} filters={filters}/>
                </div>
            </div>
            <main className="container-fluid">
                <div className="row">
                    <aside className="d-none d-xxl-block col-xxl-2 border-end shadow-sm">
                        <h2>Filters</h2>
                        <StationFilters filters={filters} onFiltersChange={onFiltersChanged} clearAllFilters={clearAllFilters}/>
                    </aside>
                    <section className="col-12 col-xxl-10">
                        <h1 className="page-header-margin text-center">Meetstations</h1> <Link to="/admin/stations/toevoegen" className="btn btn-primary">Voeg Meetstation Toe</Link>
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        {loading ? <LoadingComponent message="Stations aan het ophalen..." isFullScreen={true}/> : (
                            stations.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                        <tr>
                                            <th>Naam</th>
                                            <th>Gebruiker</th>
                                            <th>Actief</th>
                                            <th>Publiek</th>
                                            <th>Database Tag</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {stations.map(station => (
                                            <tr key={station.stationid} onClick={() => navigateToDetails(station)}>
                                                <td>{station.name}</td>
                                                <td>{station.username ? `${station.username} (${station.userid})` : `Geen gebruiker (${station.userid || 'Geen ID'})`}</td>
                                                <td>{station.isActive ? 'Ja' : 'Nee'}</td>
                                                <td>{station.is_public ? 'Ja' : 'Nee'}</td>
                                                <td>{station.database_tag}</td>
                                                <td>
                                                    <Link className="btn btn-sm btn-outline-dark">
                                                        <i className="bi bi-arrow-right"></i>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <div>Geen stations gevonden.</div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}