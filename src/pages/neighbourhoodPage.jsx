import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { backendApi } from "../utils/backend-api.jsx";

import NeighbourhoodSidebar from "../components/neighbourhoods/neighbourhoodSidebar.jsx";
import NeighbourhoodDetail from "../components/neighbourhoods/neighbourhoodDetail.jsx";
import Preloader, { Spinner } from "../components/ui/Preloader.jsx";

import "./neighbourhood-page.css";

export default function NeighbourhoodPage() {
    const { id } = useParams();

    const [neighbourhoods, setNeighbourhoods] = useState([]);
    const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("az");
    // `ready` flips true after the first successful load and never goes back:
    // the full-page loader is gated on it, so refreshes keep the page visible.
    const [ready, setReady] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadNeighbourhoods = useCallback(() => {
        const timestamp = new Date().toISOString();

        setRefreshing(true);

        backendApi.get(`/neighbourhood/history?timestamp=${timestamp}`)
            .then((response) => {
                setNeighbourhoods(response.data);
                setErrMsg("");
            })
            .catch(() => {
                setErrMsg("Het ophalen van de wijken is mislukt.");
            })
            .finally(() => {
                setReady(true);
                setRefreshing(false);
            });
    }, []);

    useEffect(() => {
        loadNeighbourhoods();
    }, [loadNeighbourhoods]);

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

            const pm25A = Number(a.avgPm25);
            const pm25B = Number(b.avgPm25);

            const hasPm25A = Number.isFinite(pm25A);
            const hasPm25B = Number.isFinite(pm25B);

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

                case "pm25-desc":
                    if (!hasPm25A && !hasPm25B) return 0;
                    if (!hasPm25A) return 1;
                    if (!hasPm25B) return -1;
                    return pm25B - pm25A;

                case "pm25-asc":
                    if (!hasPm25A && !hasPm25B) return 0;
                    if (!hasPm25A) return 1;
                    if (!hasPm25B) return -1;
                    return pm25A - pm25B;

                case "az":
                default:
                    return nameA.localeCompare(nameB);
            }
        });
    }, [neighbourhoods, searchQuery, sortOption]);

    // Full-page loader only on the very first load; refreshes keep content shown.
    if (!ready) {
        return <Preloader message="Wijken laden…" />;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
                    <i className="bi bi-geo-alt text-brand-500" aria-hidden="true"></i>
                    Wijken
                </h1>

                <div className="flex items-center gap-3">
                    {refreshing && (
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                            <Spinner className="h-4 w-4 text-brand-500" />
                            Bijwerken…
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={loadNeighbourhoods}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
                        Vernieuwen
                    </button>
                </div>
            </div>

            {errMsg && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                    {errMsg}
                </div>
            )}

            <section className="neighbourhood-page">
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
        </div>
    );
}