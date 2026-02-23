import { useState, useEffect } from 'react';
import { backendApi } from '../../../../utils/backend-api';
import { useNavigate } from 'react-router-dom';

export default function MeetstationToevoegen() {
    const [name, setName] = useState('');
    const [registrationCode, setRegistrationCode] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await backendApi.get('/Location/all');
                setLocations(response.data);
            } catch (error) {
                console.error('Fout bij ophalen van locaties:', error);
            }
        };

        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newStation = {
            name,
            database_tag: 'MJS',
            is_public: false,
            is_active: false,
            registrationCode,
            location_locationid: locationId
        };
        try {
            await backendApi.post('/Meetstation/add', newStation);
            navigate('/admin/stations');
        } catch (error) {
            console.error('Fout bij toevoegen van meetstation:', error);
        }
    };

    return (
        <div className="container gy-5 mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h4 className="mb-4 text-center"><b>Nieuw Meetstation Toevoegen</b></h4>
                    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
                        <div className="mb-3">
                            <label className="form-label">Naam (optioneel)</label>
                            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Registratiecode</label>
                            <input type="text" className="form-control" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Locatie ID</label>
                            <select className="form-select" value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                                <option value="">Selecteer een locatie</option>
                                {locations.map((loc) => (
                                    <option key={loc.locationid} value={loc.locationid}>{loc.locationid}</option>
                                ))}
                            </select>
                        </div>
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-dark" onClick={() => navigate(-1)}>Terug</button>
                            <button type="submit" className="btn btn-primary">Toevoegen</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}