import {useEffect, useRef} from "react";
import PropTypes from "prop-types";
import ZoomableChart from "../charts/ZoomableChart";
import {useChartZoom} from "../charts/UseChartZoom";

const LINES = [
    {key: "min", name: "Min", color: "#0000ff"},
    {key: "max", name: "Max", color: "#ff0000"},
    {key: "avg", name: "Gemiddeld", color: "#00ee00"},
];

export default function GraphView({graphData, dataType, zoom: zoomFromParent}) {
    // Komt er een zoom van de bovenliggende pagina? Dan die gebruiken.
    // Zo niet, dan gebruikt de grafiek een eigen zoom.
    const localZoom = useChartZoom();
    const zoom = zoomFromParent ?? localZoom;

    const colorContainerRef = useRef(null);
    const secondColorDivRef = useRef(null);

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
        const validMeasurements = graphData.filter(measurement =>
            measurement.min != null && measurement.max != null && measurement.avg != null
        );

        if (validMeasurements.length === 0) {
            return <div>Er zijn geen metingen voor deze datum</div>;
        }

        const round = (v) => (v == null || isNaN(v) ? '—' : Number(v).toFixed(1));
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

    return (
        <div className="flex flex-col md:flex-row">
            <div ref={colorContainerRef} className="color mr-px w-full md:h-[30%] md:flex-[5]">
                <br />
                <div className="mx-auto max-w-3xl px-4">
                    <label className="mt-1 italic">Meting van: {new Date().toLocaleString('nl-NL')}</label>
                    <br />
                    <label className="mt-2 flex items-center gap-2 font-bold">
                        <i className="bi bi-graph-up text-brand-500"></i> Historische {dataType} data
                    </label>
                    <ZoomableChart
                        data={graphData}
                        lines={LINES}
                        xKey="timestamp"
                        zoom={zoom}
                    />
                </div>
            </div>
            <div ref={secondColorDivRef} className="color hide-scrollbar w-full overflow-y-auto md:flex-1">
                <div className="mx-auto max-w-3xl px-4">
                    <label className="mb-2 mt-2 flex items-center gap-2 font-bold">
                        <i className="bi bi-list-ol text-brand-500"></i> Laatste 10 Metingen
                    </label>
                    <div className="space-y-2 pb-4">
                        {getLastTenMeasurements()}
                    </div>
                </div>
            </div>
        </div>
    );
}

GraphView.propTypes = {
    graphData: PropTypes.array.isRequired,
    dataType: PropTypes.string.isRequired,
    zoom: PropTypes.object,
};