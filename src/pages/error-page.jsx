import {useRouteError} from "react-router-dom";
import {useState, useEffect} from "react";

export default function ErrorPage() {
    const [title, setTitle] = useState("Error");
    const [message, setMessage] = useState("Something went wrong. Please try again later.");
    const error = useRouteError();
    console.error(error);

    useEffect(() => {
        if (error.message === "Unauthorized" || error.status === 401) {
            setTitle("Geen toegang");
            setMessage("U dient ingelogd te zijn om deze pagina te kunnen bekijken");
        } else if (error.message === "Forbidden" || error.status === 403) {
            setTitle("Verboden toegang");
            setMessage("U bent niet gemachtigd om deze pagina te bekijken.");
        } else if (error.status === 404) {
            setTitle("Pagina niet gevonden");
            setMessage("De pagina die u zoekt bestaat niet.");
        } else {
            setTitle("Fout");
            setMessage("Er is iets misgegaan. Probeer het later opnieuw.");
        }
    }, [error]);

    return (
        <div className="row">
            <div className="col text-center page-header-margin">
                <h1>{title}</h1>
                <p>{message}</p>
            </div>
        </div>
    );
}