import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backendApi } from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";

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
            }
        };

        if (stationId) {
            fetchStation();
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

    return (
        <div className="color">
            <br />
            <div className="mx-auto max-w-3xl px-4">
                <div>
                    <div className="text-center">
                        <h4 className="text-xl"><b>Aanpassen station nummer {station.stationid}</b></h4>
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
                                Terug
                            </Button>
                            <Button variant="primary" type="submit">Opslaan</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
