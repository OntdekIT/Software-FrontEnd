import { useEffect, useMemo, useState } from "react";
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
    const [sortOption, setSortOption] = useState("az");

    useEffect(() => {
        const timestamp = new Date().toISOString();

        backendApi.get(`/neighbourhood/history?timestamp=${timestamp}`)
            .then((response) => {
                setNeighbourhoods(response.data);
            })
            .catch(() => {
                setErrMsg("Het ophalen van de wijken is mislukt.");
            });
    }, []);

    useEffect(() => {
        if (!id) {
            setSelectedNeighbourhood(null);
            return;
        }

        const selected = neighbourhoods.find(
            neighbourhood => Number(neighbourhood.id) === Number(id)
        );

        setSelectedNeighbourhood(selected ?? null);
    }, [id, neighbourhoods]);

    const displayedNeighbourhoods = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = neighbourhoods.filter((neighbourhood) =>
            neighbourhood.name.toLowerCase().includes(query)
        );

        return [...filtered].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            const tempA = Number(a.avgTemp);
            const tempB = Number(b.avgTemp);

            const hasTempA = Number.isFinite(tempA);
            const hasTempB = Number.isFinite(tempB);

            switch (sortOption) {
                case "za":
                    return nameB.localeCompare(nameA);

                case "temp-desc":
                    if (!hasTempA && !hasTempB) return 0;
                    if (!hasTempA) return 1;
                    if (!hasTempB) return -1;
                    return tempB - tempA;

                case "temp-asc":
                    if (!hasTempA && !hasTempB) return 0;
                    if (!hasTempA) return 1;
                    if (!hasTempB) return -1;
                    return tempA - tempB;

                case "az":
                default:
                    return nameA.localeCompare(nameB);
            }
        });
    }, [neighbourhoods, searchQuery, sortOption]);

    return (
        <section className="neighbourhood-page">
            {errMsg && (
                <div className="neighbourhood-error">
                    <p>{errMsg}</p>
                </div>
            )}

            <NeighbourhoodSidebar
                neighbourhoods={displayedNeighbourhoods}
                selectedId={id}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            <NeighbourhoodDetail neighbourhood={selectedNeighbourhood} />
        </section>
    );
}