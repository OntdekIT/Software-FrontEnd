import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backendApi } from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";
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

    if (loading) {
        return (
            <div className="color">
                <div className="mx-auto max-w-3xl px-4 py-6">
                    <div className="text-center">
                        <Skeleton className="mx-auto h-6 w-72" />
                        <Skeleton className="mx-auto mt-2 h-4 w-96 max-w-full" />
                    </div>
                    <div className="mx-auto mt-6 max-w-md space-y-4">
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
                    <div className="mx-auto mt-8 flex max-w-md gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="color">
            <div className="mx-auto max-w-3xl px-4 py-6">
                <div>
                    <div className="text-center">
                        <h4 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900">
                            <i className="bi bi-pencil-square" aria-hidden="true"></i>
                            Aanpassen station nummer {station.stationid}
                        </h4>
                        <label className="mt-1 block">
                            <div className="text-sm text-gray-500">Hier kunnen de meetstation gegevens aangepast worden</div>
                        </label>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mx-auto mt-4 max-w-md">
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

                        <div className="mx-auto mt-8 flex max-w-md gap-2">
                            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                                <i className="bi bi-arrow-left" aria-hidden="true"></i>
                                Terug
                            </Button>
                            <Button variant="primary" type="submit">
                                <i className="bi bi-check-lg" aria-hidden="true"></i>
                                Opslaan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
