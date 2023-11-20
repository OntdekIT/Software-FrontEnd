import { Polygon, Popup } from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";

const RegionLayer = ({ data }) => {
    let mintemp = Number.MAX_VALUE;
    let maxtemp = Number.MIN_VALUE;
    let tempDif = 1;

    data.forEach((neighbourhood) => {
        if (!isNaN(neighbourhood.avgTemp)) {
            if (neighbourhood.avgTemp < mintemp) {
                mintemp = neighbourhood.avgTemp;
            }
            if (neighbourhood.avgTemp > maxtemp) {
                maxtemp = neighbourhood.avgTemp;
            }
        }
    });

    if (maxtemp - mintemp !== 0) {
        tempDif = maxtemp - mintemp;
    }

    var colorDictionary = {
        0: "rgb(206,255,255)",
        1: "rgb(198,247,214)",
        2: "rgb(162,244,155)",
        3: "rgb(187,228,83)",
        4: "rgb(213,206,4)",
        5: "rgb(231,181,3)",
        6: "rgb(241,153,3)",
        7: "rgb(246,121,11)",
        8: "rgb(249,73,2)",
        9: "rgb(228,5,21)",
        10: "rgb(168,0,3)",
    }

    function setRegionColour(value) {
        if (isNaN(value))
            return "rgb(136,136,136)";

        let contrastValue = (value - mintemp) / tempDif;
        let colorIndex = Math.round(contrastValue * (Object.keys(colorDictionary).length - 1));
        return colorDictionary[colorIndex];;
    }

    return (
        <>
            {
                data.map((neighbourhood) => (
                    <Polygon positions={neighbourhood.coordinates} key={neighbourhood.id} pathOptions={{ color: setRegionColour(neighbourhood.avgTemp) }} opacity={neighbourhood.avgTemp === "NaN" ? .4 : 1} fillOpacity={neighbourhood.avgTemp === "NaN" ? .25 : .5}>
                        <Popup>
                            <label className="bold">{neighbourhood.name}</label> <br />

                            <div>
                                <label>
                                    {/* TODO: Netter neerzetten */}
                                    {neighbourhood.avgTemp !== "NaN" ? "Gemiddelde wijktemperatuur: " + RoundToOneDecimal(neighbourhood.avgTemp) + " °C" : "Geen data beschikbaar"}
                                </label>
                            </div>
                        </Popup>
                    </Polygon>
                ))
            }
        </>)

}

export default RegionLayer;