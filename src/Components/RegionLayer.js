import {Polygon, Popup} from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";

const RegionLayer = ({ data, visible }) => {
    if (!visible) return (<></>);

    let mintemp= Number.MAX_VALUE;
    let maxtemp = Number.MIN_VALUE;
    let tempDif = 1;

    data.map((neighbourhood) => {
        if (!isNaN(neighbourhood.avgTemp)){
            if (neighbourhood.avgTemp < mintemp){
                mintemp = neighbourhood.avgTemp;
            }
            if (neighbourhood.avgTemp > maxtemp){
                maxtemp = neighbourhood.avgTemp;
            }
        }
    });
    if (maxtemp - mintemp != 0){
        tempDif = maxtemp - mintemp;
    }

    function setRegionColour(value){
        if (isNaN(value)){return "rgb(100,100,100)"}

        let contrastValue = (value-mintemp)/tempDif;
        let red = Math.round(Red(contrastValue)*255);
        let green = Math.round(Green(contrastValue)*255);
        let blue = Math.round(Blue(contrastValue)*255);

        let rgb = {red,green,blue}
        return  "rgb("+rgb.red.toString()+","+
            rgb.green.toString()+","+
            rgb.blue.toString()+")";
    }
    function Red(contrastValue){
        return (Math.pow(2,contrastValue)-1);
    }
    function Green(contrastValue){
        return Math.abs((-4*Math.pow(contrastValue,2))+(4*contrastValue));
    }
    function Blue(contrastValue){
        return ((Math.pow(2,1-contrastValue)-1));
    }

    return (
        <>
            {data.map(( neighbourhood ) => (
                <Polygon positions={ neighbourhood.coordinates } key={ neighbourhood.id } color={setRegionColour(neighbourhood.avgTemp)} opacity={neighbourhood.avgTemp === "NaN" ? .4 : 1} fillOpacity={neighbourhood.avgTemp === "NaN" ? .25 : .5}>
                    <Popup>
                        <label className="bold">{ neighbourhood.name }</label> <br />

                        <div>
                            <label>
                                {/* TODO: Netter neerzetten */}
                                { neighbourhood.avgTemp !== "NaN" ? "Gemiddelde wijktemperatuur: " + RoundToOneDecimal(neighbourhood.avgTemp) + " °C" : "Geen data beschikbaar" }
                            </label>
                        </div>
                    </Popup>
                </Polygon>
            ))}
        </>)

}
function getDataTypeSuffix(typeId) {
    switch (typeId) {
        case 1:
            return "°C";
        case 2:
            return "ppm";
        case 3:
            return "ppm";
        case 4:
            return "ppm";
        case 5:
            return "%";
        case 6:
            return "km/h";
        default:
            return "Onbekend.";
    }
}

export default RegionLayer;