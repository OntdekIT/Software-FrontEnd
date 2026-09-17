import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backendApi } from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { Skeleton, SkeletonText } from "../../components/ui/Skeleton.jsx";

export default function EditStation() {
    const inputValues = {
        stationid: '0',
        name: '',
        database_tag: '',
        registrationCode: '',
        location_locationid: 0,
        userid: 0,
        is_public: false,
    };

    const [station, setStation] = useState(inputValues);
    const [visibility, setVisibility] = useState('0');
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { stationId } = useParams();

    useEffect(() => {
        const fetchStation = async () => {
            try {
                const response = await backendApi.get(`/Meetstation/${stationId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    withCredentials: true
                });

                setStation(response.data);
                setVisibility(response.data.is_public ? '1' : '0');
            } catch (err) {
                console.error("Error fetching station: ", err);
                if (err.response?.status === 401) {
                    window.location.href = "/login";
                }
            } finally {
                setLoading(false);
            }
        };

        if (stationId) {
            fetchStation();
        } else {
            setLoading(false);
        }
    }, [stationId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStation({ ...station, [name]: value });

        if (name === "name" && value.trim() !== "") {
            setErrorMessage(""); 
        }
    };

    const dropdownHandler = (event) => {
        const value = event.target.value;
        setVisibility(value);
        setStation({ ...station, is_public: value === '1' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (station.name.trim() === "") {
            setErrorMessage("U bent verplicht alle velden in te vullen");
            return;
        }

        const updateRequest = {
            name: station.name,
            is_public: visibility === '1',
        };

        try {
            await backendApi.put(`/Meetstation/edit/${stationId}`, updateRequest, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                withCredentials: true
            });
            navigate(-1);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    // Route-driven modal: this page is reached via /stations/:id/edit and renders
    // as an overlay over the previous view; closing navigates back so the URL and
    // browser back-button drive the modal (react-router).
    const close = () => navigate(-1);

    if (loading) {
        return (
            <Modal show={true} onClose={close} title="Station bewerken" size="md">
                <div className="space-y-4">
                    <div>
                        <Skeleton className="mb-2 h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                        <Skeleton className="mb-2 h-4 w-48" />
                        <Skeleton className="h-10 w-full" />
                        <SkeletonText lines={2} className="mt-2" />
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal show={true} onClose={close} title={`Station ${station.stationid} bewerken`} size="md">
            <p className="mb-4 text-sm text-gray-500">Hier kunnen de meetstation gegevens aangepast worden.</p>
            <form id="edit-station-form" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-1 block font-medium">Station naam</label>
                    <input
                        onChange={handleChange}
                        className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 ${errorMessage ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        value={station.name}
                        name="name"
                        type="text"
                    />
                    {errorMessage && <div className="mt-1 text-sm text-red-600">{errorMessage}</div>}

                    <div className="mt-4">
                        <label className="mb-1 block font-medium">Zichtbaarheid van meetstation</label>
                        <select
                            value={visibility}
                            onChange={dropdownHandler}
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            name="visibility"
                        >
                            <option value="0">Onzichtbaar</option>
                            <option value="1">Zichtbaar</option>
                        </select>
                        {visibility === '0' && (
                            <div className="mt-1 text-sm text-gray-500">
                                Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                            </div>
                        )}
                        {visibility === '1' && (
                            <div className="mt-1 text-sm text-gray-500">
                                Het station is zichtbaar en kan door iedereen bekeken worden.
                            </div>
                        )}
                    </div>
                </div>
            </form>
            <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={close}>
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                    Terug
                </Button>
                <Button variant="primary" type="submit" form="edit-station-form">
                    <i className="bi bi-check-lg" aria-hidden="true"></i>
                    Opslaan
                </Button>
            </div>
        </Modal>
    );
}
