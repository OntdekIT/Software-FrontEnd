import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backendApi } from "../../utils/backend-api.jsx";

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
            <div className="container gy-5">
                <div>
                    <div className="row">
                        <div className="col-4"></div>
                        <div className="col-4">
                            <h4><b>Aanpassen station nummer {station.stationid}</b></h4>
                            <label className="labelMargin">
                                <div className="form-text">Hier kunnen de meetstation gegevens aangepast worden</div>
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row mt-1">
                            <div className="col-4"></div>
                            <div className="col-4">
                                <label className="label">Station naam</label>
                                <input
                                    onChange={handleChange}
                                    className={`form-control ${errorMessage ? 'is-invalid' : ''}`} 
                                    value={station.name}
                                    name="name"
                                    type="text"
                                />
                                {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}

                                <div className="form-group">
                                    <label className="form-label">Zichtbaarheid van meetstation</label>
                                    <select
                                        value={visibility}
                                        onChange={dropdownHandler}
                                        className="form-select"
                                        name="visibility"
                                    >
                                        <option value="0">Onzichtbaar</option>
                                        <option value="1">Zichtbaar</option>
                                    </select>
                                    {visibility === '0' && (
                                        <div className="form-text">
                                            Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                                        </div>
                                    )}
                                    {visibility === '1' && (
                                        <div className="form-text">
                                            Het station is zichtbaar en kan door iedereen bekeken worden.
                                        </div>
                                    )}
                                </div>
                            </div>n
                        </div>

                        <div className="row mt-5">
                            <div className="col-4"></div>
                            <div className="col-5">
                                <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
                                    Terug
                                </button>
                                <button className="btn btn-primary" type="submit">Opslaan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
