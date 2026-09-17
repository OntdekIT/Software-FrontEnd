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

        // Return the last 10 valid measurements
        return validMeasurements.slice(-10).map((measurement, index) => (
            <div key={index}>
                <b>Meting {validMeasurements.length - 10 + index + 1}: {measurement.timestamp}</b>
                <p>Min: {measurement.min}<br/>
                    Max: {measurement.max}<br/>
                    Avg: {measurement.avg}</p>
                <hr className="my-0.5 border-gray-200" />
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
                    <label className="mt-2 flex items-center gap-2 font-bold">
                        <i className="bi bi-list-ol text-brand-500"></i> Laatste 10 Metingen
                    </label>
                    <div>
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