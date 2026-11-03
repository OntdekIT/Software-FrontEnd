import {useRouteError, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import Button from "../components/ui/Button.jsx";

export default function ErrorPage() {
    const [title, setTitle] = useState("Error");
    const [message, setMessage] = useState("Something went wrong. Please try again later.");
    const [icon, setIcon] = useState("bi-exclamation-triangle");
    const error = useRouteError();
    const navigate = useNavigate();
    console.error(error);

    useEffect(() => {
        if (error.message === "Unauthorized" || error.status === 401) {
            setTitle("Geen toegang");
            setMessage("U dient ingelogd te zijn om deze pagina te kunnen bekijken");
            setIcon("bi-lock");
        } else if (error.message === "Forbidden" || error.status === 403) {
            setTitle("Verboden toegang");
            setMessage("U bent niet gemachtigd om deze pagina te bekijken.");
            setIcon("bi-shield-lock");
        } else if (error.status === 404) {
            setTitle("Pagina niet gevonden");
            setMessage("De pagina die u zoekt bestaat niet.");
            setIcon("bi-signpost-2");
        } else {
            setTitle("Fout");
            setMessage("Er is iets misgegaan. Probeer het later opnieuw.");
            setIcon("bi-exclamation-triangle");
        }
    }, [error]);

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <i className={`bi ${icon} text-3xl`} aria-hidden="true"></i>
                </span>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
                <p className="mb-6 text-gray-600">{message}</p>
                <Button variant="primary" onClick={() => navigate("/")}>
                    <i className="bi bi-house" aria-hidden="true"></i>
                    Terug naar home
                </Button>
            </div>
        </div>
    );
}
