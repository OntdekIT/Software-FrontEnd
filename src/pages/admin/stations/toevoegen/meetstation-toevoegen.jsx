import { useState, useEffect } from 'react';
import { backendApi } from '../../../../utils/backend-api';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button.jsx';

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
        <div className="mx-auto mt-4 w-full max-w-2xl px-4">
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <h4 className="mb-4 text-center text-xl font-bold">Nieuw Meetstation Toevoegen</h4>
                    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 shadow">
                        <div className="mb-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Naam (optioneel)</label>
                            <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
                        </div>
                        <div className="mb-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Registratiecode</label>
                            <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Locatie ID</label>
                            <select className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                                <option value="">Selecteer een locatie</option>
                                {locations.map((loc) => (
                                    <option key={loc.locationid} value={loc.locationid}>{loc.locationid}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between">
                            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Terug</Button>
                            <Button type="submit" variant="primary">Toevoegen</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}