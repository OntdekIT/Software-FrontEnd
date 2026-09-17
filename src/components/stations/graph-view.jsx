import {useEffect, useRef, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import PropTypes from "prop-types";

export default function GraphView({graphData, dataType}) {
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);
    const [filteredMeasurements, setFilteredMeasurements] = useState([]);
    const colorContainerRef = useRef(null);
    const secondColorDivRef = useRef(null);

    useEffect(() => {
        setFilteredMeasurements(graphData);
    }, [graphData]);

    useEffect(() => {
        const syncDivHeights = () => {
            if (colorContainerRef.current && secondColorDivRef.current) {
                const height = colorContainerRef.current.clientHeight;
                secondColorDivRef.current.style.height = `${height}px`;
            }
        };
        syncDivHeights();
        window.addEventListener("resize", syncDivHeights);
        return () => {
            window.removeEventListener("resize", syncDivHeights);
        };
    }, [graphData]);


    const getLastTenMeasurements = () => {
        // Filter out measurements without min, max, and avg
        const validMeasurements = filteredMeasurements.filter(measurement =>
            measurement.min != null && measurement.max != null && measurement.avg != null
        );

        // If there are no valid measurements, display the message
        if (validMeasurements.length === 0) {
            return <div>Er zijn geen metingen voor deze datum</div>;
        }

        const round = (v) => (v == null || isNaN(v) ? '—' : Number(v).toFixed(1));
        // Return the last 10 valid measurements, most recent first, as tidy cards.
        return validMeasurements.slice(-10).reverse().map((measurement, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <i className="bi bi-calendar3 text-brand-500" aria-hidden="true"></i>
                    {measurement.timestamp}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-blue-50 py-1">
                        <div className="text-xs text-gray-500">Min</div>
                        <div className="font-semibold text-blue-600">{round(measurement.min)}</div>
                    </div>
                    <div className="rounded-md bg-red-50 py-1">
                        <div className="text-xs text-gray-500">Max</div>
                        <div className="font-semibold text-red-600">{round(measurement.max)}</div>
                    </div>
                    <div className="rounded-md bg-brand-50 py-1">
                        <div className="text-xs text-gray-500">Gem.</div>
                        <div className="font-semibold text-brand-700">{round(measurement.avg)}</div>
                    </div>
                </div>
            </div>
        ));
    };

    const handleLegendChange = (e) => {
        if (e.dataKey === "min")
            setShowMin(!showMin);
        if (e.dataKey === "max")
            setShowMax(!showMax);
        if (e.dataKey === "avg")
            setShowGem(!showGem);
    };

    return (
        <div className="flex">
            <div ref={colorContainerRef} key={"colorContainer"} className="color mr-px h-[30%] flex-[5]">
                <br />
                <div className="mx-auto max-w-3xl px-4">
                    <label className="mt-1 italic">Meting van: {new Date().toLocaleString('nl-NL')}</label>
                    <br></br>
                    <label className="mt-2 flex items-center gap-2 font-bold">
                        <i className="bi bi-graph-up text-brand-500"></i> Historische {dataType} data
                    </label>
                    <ResponsiveContainer minWidth={250} minHeight={250}>
                        <LineChart data={graphData}>
                            <XAxis dataKey="timestamp"/>
                            <YAxis width={30}/>
                            <CartesianGrid stroke="#ccc"/>
                            <Legend onClick={handleLegendChange}/>
                            <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff"
                                  hide={showMin}
                                  dot={false}/>
                            <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000"
                                  hide={showMax}
                                  dot={false}/>
                            <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00"
                                  hide={showGem}
                                  dot={false}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div ref={secondColorDivRef} className="color hide-scrollbar flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-4" style={{ width: "calc(100%) - 20px" }}>
                    <label className="mb-2 mt-2 flex items-center gap-2 font-bold">
                        <i className="bi bi-list-ol text-brand-500"></i> Laatste 10 Metingen
                    </label>
                    <div className="space-y-2 pb-4">
                        {getLastTenMeasurements()}
                    </div>
                </div>
            </div>
        </div>
    )
}

GraphView.propTypes = {
    graphData: PropTypes.array.isRequired,
    dataType: PropTypes.string.isRequired
}