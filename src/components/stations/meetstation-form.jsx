import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { backendApi } from '../../utils/backend-api.jsx';
import Button from '../ui/Button.jsx';
import Preloader from '../ui/Preloader.jsx';
import { useToast } from '../ui/toast.jsx';

// Herbruikbaar formulier voor het toevoegen van een meetstation.
// Rendert alleen de velden + submit-knop, geen paginacontainer of terug-link.
// Bij succes wordt props.onSuccess() aangeroepen; de aanroeper bepaalt navigatie.
export default function MeetstationForm({ onSuccess, onCancel }) {
    const [name, setName] = useState('');
    const [registrationCode, setRegistrationCode] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await backendApi.get('/Location/all');
                setLocations(response.data);
            } catch (error) {
                console.error('Fout bij ophalen van locaties:', error);
            } finally {
                setLoading(false);
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
            toast.success('Meetstation toegevoegd');
            onSuccess?.();
        } catch (error) {
            console.error('Fout bij toevoegen van meetstation:', error);
        }
    };

    if (loading) {
        return <Preloader message="Locaties laden…" />;
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Naam (optioneel)</label>
                <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" />
            </div>
            <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Registratiecode</label>
                <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} required />
            </div>
            <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Locatie ID</label>
                <select className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                    <option value="">Selecteer een locatie</option>
                    {locations.map((loc) => (
                        <option key={loc.locationid} value={loc.locationid}>{loc.locationid}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                    Terug
                </Button>
                <Button type="submit" variant="primary">
                    <i className="bi bi-plus-lg" aria-hidden="true"></i>
                    Toevoegen
                </Button>
            </div>
        </form>
    );
}

MeetstationForm.propTypes = {
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
};
