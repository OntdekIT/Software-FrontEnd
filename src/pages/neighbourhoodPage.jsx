import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backendApi } from "../utils/backend-api.jsx";

import NeighbourhoodSidebar from "../components/neighbourhoods/neighbourhoodSidebar.jsx";
import NeighbourhoodDetail from "../components/neighbourhoods/neighbourhoodDetail.jsx";

import "./neighbourhood-page.css";

export default function NeighbourhoodPage() {
    const { id } = useParams();

    const [neighbourhoods, setNeighbourhoods] = useState([]);
    const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timestamp = new Date().toISOString();

        backendApi.get(`/neighbourhood/history?timestamp=${timestamp}`)
            .then((response) => {
                setNeighbourhoods(response.data);

                if (id) {
                    const selected = response.data.find(
                        neighbourhood => Number(neighbourhood.id) === Number(id)
                    );

                    setSelectedNeighbourhood(selected ?? null);
                }
            })
            .catch(() => {
                setErrMsg("Het ophalen van de wijken is mislukt.");
            });
    }, [id]);

    useEffect(() => {
        if (searchQuery.trim().length < 3) {
            const timestamp = new Date().toISOString();

            backendApi.get(`/neighbourhood/history?timestamp=${timestamp}`)
                .then((response) => {
                    setNeighbourhoods(response.data);
                });

            return;
        }

        backendApi.get(`/neighbourhood/search?query=${searchQuery}`)
            .then((response) => {
                setNeighbourhoods(response.data);
            })
            .catch(() => {
                setErrMsg("Zoeken mislukt.");
            });
    }, [searchQuery]);

    return (
        <section className="neighbourhood-page">
            {errMsg && (
                <div className="neighbourhood-error">
                    <p>{errMsg}</p>
                </div>
            )}

            <NeighbourhoodSidebar
                neighbourhoods={neighbourhoods}
                selectedId={id}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <NeighbourhoodDetail neighbourhood={selectedNeighbourhood} />
        </section>
    );
}