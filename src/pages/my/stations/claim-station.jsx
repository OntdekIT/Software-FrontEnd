import {backendApi} from "../../../utils/backend-api.jsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Preloader, {Spinner} from "../../../components/ui/Preloader.jsx";
import {useToast} from "../../../components/ui/toast.jsx";

export default function ClaimStation() {
    const inputvalues = {
        stationid: localStorage.getItem("stationId"),
        name: '',
        database_tag: '',
        location_locationid: 0,
        userid: 0,
        is_public: false,
    };

    const stepvalues = {
        num: '',
        title: '',
        subTitle: '',
        description: '',
        onClick: ''
    }

    const [station, setStation] = useState(inputvalues);
    const [step, setStep] = useState(stepvalues);
    const [workshopCode, setWorkshopCode] = useState(null);
    const [verifying, setVerifying] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        station.visibility = '0';
        if (station.stationid != null) {
            SetStepValues(2);
        } else {
            SetStepValues(1);
        }
        // Initialise step once on mount; adding station would re-run on every edit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const SetStepValues = (num) => {
        switch (num) {
            case 1:
                setStep({
                    num: 1,
                    title: "Meetstation Zoeken",
                    subTitle: 'Meetstation nummer',
                    description: 'Meetstation nummer is aanwezig op uw meetstation.',
                })
                break;
            case 2:
                setStep({
                    num: 2,
                    title: "Meetstation Privacy",
                    subTitle: 'Meetstation privacy instellen',
                    description: 'Hier kunt u kiezen tot op welke hoogte uw meetstation te zien is.',
                });
                break;
            case 3:
                setStep({
                    num: 3,
                    title: "Meetstation Naam",
                    subTitle: 'Meetstation naam instellen',
                    description: 'Hier kunt u een naam aan uw meetstation geven.',
                });
                break;
            case 4:
                setStep({
                    num: 4,
                    title: "Meetstation gegevens",
                    subTitle: 'Meetstation gegevens controleren',
                    description: 'Hier kunt u de ingevulde gegevens controleren.',
                });
                break;
        }
    }

    const verifyStationNumber = async () => {
        try {
            if (!station.stationid) {
                toast.error("Vul een station nummer in.");
            } else if (!workshopCode) {
                toast.error("Vul een workshop code in.");
            } else {
                setVerifying(true);
                const response = await backendApi.get(`/Meetstation/Availibility/${station.stationid}/${workshopCode}`, {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: false
                });
                if (response.data === 200) {
                    SetStepValues(step.num + 1);
                } else if (response.data === 402) {
                    toast.error("Meetstation is niet beschikbaar");
                } else if (response.data === 403) {
                    toast.error("Workshop code is onjuist");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Er is iets misgegaan");
        } finally {
            setVerifying(false);
        }
    }

    const goForward = () => {
        SetStepValues(step.num + 1);
    }

    const goBack = () => {
        if (step.num === 1) {
            navigate(-1);
        }
        SetStepValues(step.num - 1);
    }

    const handleChange = (event) => {
        const {name, value} = event.target;
        setStation({...station, [name]: value});
    };

    const handleWorkshopCodeChange = (event) => {
        setWorkshopCode(event.target.value);
    }

    const handleButtonClick = (num) => {
        if (num === 1) {
            verifyStationNumber();
        } else if (num === 4) {
            handleSubmit();
        } else {
            goForward();
        }
    }

    const handleSubmit = () => {
        const currentStation = {
            stationid: station.stationid,
            name: station.name,
            database_tag: station.databaseTag,
            is_public: station.visibility === '1',
        };

        backendApi.put('/Meetstation/Claim', currentStation, {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        })
            .then(() => {
                localStorage.removeItem("stationId");
                toast.success("Meetstation succesvol geclaimd");
                navigate('/my/stations');
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.headers);
                } else if (error.request) {
                    console.error(error.request);
                } else {
                    console.error("Error", error.message);
                }
                toast.error("Meetstation claimen is mislukt");
            });
    };

    // Route-driven modal wizard: reached via /my/stations/claim, rendered as an
    // overlay; closing (backdrop/Escape/X) returns to the stations overview.
    const closeWizard = () => navigate('/my/stations');

    if (!step.num) {
        return (
            <Modal show={true} onClose={closeWizard} title="Meetstation claimen" size="md">
                <Preloader message="Meetstation claimen voorbereiden…" />
            </Modal>
        );
    }

    return (
        <Modal
            show={true}
            onClose={closeWizard}
            size="md"
            title={(
                <span className="flex items-center gap-2">
                    <i className="bi bi-broadcast" aria-hidden="true"></i>
                    ({step.num}/4) {step.title}
                </span>
            )}
        >
            <div className="mx-auto max-w-md space-y-4">
                <div>
                    <h5 className="text-lg font-semibold text-gray-900">{step.subTitle}</h5>
                    <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                </div>

                {(() => {
                    switch (step.num) {
                        case 1:
                            return (
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        name="workshopCode"
                                        placeholder="Workshop Code..."
                                        onChange={handleWorkshopCodeChange}
                                        value={workshopCode}
                                        required
                                    />
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        name="stationid"
                                        placeholder="Station nummer..."
                                        onChange={handleChange}
                                        value={station.stationid}
                                        required
                                    />
                                </div>
                            );
                        case 2:
                            return (
                                <div>
                                    <select data-testid='Visibility'
                                        value={station.visibility}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        name="visibility"
                                    >
                                        <option value="0">Onzichtbaar</option>
                                        <option value="1">Zichtbaar</option>
                                    </select>
                                    {station.visibility === '0' && (
                                        <p className="mt-2 text-sm text-gray-500">Het station is onzichtbaar, maar de data
                                            wordt gebruikt binnen de metingen van een wijk.</p>
                                    )}
                                    {station.visibility === '1' && (
                                        <p className="mt-2 text-sm text-gray-500">Het station is zichtbaar en kan door
                                            iedereen bekeken worden.</p>
                                    )}
                                </div>
                            );
                        case 3:
                            return (
                                <div>
                                    <input
                                        data-testid='StationName'
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        value={station.name}
                                        name="name"
                                        type="text"
                                    />
                                </div>
                            );
                        case 4:
                            return (
                                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">Station nummer</span>
                                        <span className="font-medium text-gray-900">{station.stationid}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">Station naam</span>
                                        <span className="font-medium text-gray-900">{station.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Zichtbaarheid</span>
                                        {station.visibility === '0' ? (
                                            <p className="mt-1 text-gray-500">Het station is onzichtbaar, maar de data
                                                wordt gebruikt binnen de metingen van een wijk.</p>
                                        ) : station.visibility === '1' ? (
                                            <p className="mt-1 text-gray-500">Het station is zichtbaar en kan door
                                                iedereen bekeken worden.</p>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        default:
                            return null; // Default case if step.num doesn't match any specific case
                    }
                })()}
                <div className="mt-8 flex gap-2">
                    {!(step.num === 2 && localStorage.getItem("stationId") != null) && (
                        <Button variant="secondary" onClick={goBack} disabled={verifying}>
                            <i className="bi bi-arrow-left" aria-hidden="true"></i>
                            Terug
                        </Button>
                    )}
                    <Button data-testid='ClaimMeetstationNext' variant="primary" onClick={() => handleButtonClick(step.num)} disabled={verifying}>
                        {verifying ? <Spinner className="h-4 w-4" /> : (
                            <i className={`bi ${step.num === 4 ? 'bi-check-lg' : 'bi-arrow-right'}`} aria-hidden="true"></i>
                        )}
                        {step.num === 4 ? 'Claimen' : 'Volgende'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}