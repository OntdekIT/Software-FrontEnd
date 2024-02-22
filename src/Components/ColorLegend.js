import React, { useEffect, useState } from 'react';
import { spectralColors } from '../Lib/Utility';

const ColorLegend = ({ temperatures }) => {
    const [temperatureRanges, setTemperatureRanges] = useState([]);

    useEffect(() => {

        //Null values are filtered out to prevent inconsistent legend
        const filteredTemps = temperatures.filter((measurement) => measurement.temperature !== null);

        const minTemp = Math.min(...filteredTemps.map(measurement => measurement.temperature));
        const maxTemp = Math.max(...filteredTemps.map(measurement => measurement.temperature));

        // Show 5 color blocks for the amount of colors to prevent the screen to be cluttered with all colours
        const numberOfColors = 5;
        const temperatureParts = (maxTemp - minTemp) / numberOfColors;

        // Creating the data point for each temperature block
        const temperatureRanges = Array.from({ length: numberOfColors - 1 }, (_, index) => {
            const temp = (minTemp + temperatureParts * index).toFixed(1);
            const colorIndex = Math.floor((index / numberOfColors) * Object.keys(spectralColors).length);
            const color = spectralColors[Object.keys(spectralColors)[colorIndex]];
            return { color, temp };
        });

        //Replaces the first data point with the min temperature
        temperatureRanges[0].temp = minTemp.toFixed(1);
        temperatureRanges[0].color = spectralColors[Object.keys(spectralColors)[0]];

        //Replaces the last data point with the max temperature
        temperatureRanges.push({
            color: spectralColors[Object.keys(spectralColors)[Object.keys(spectralColors).length - 1]],
            temp: maxTemp.toFixed(1),
        });

        setTemperatureRanges(temperatureRanges);
    }, [temperatures]);

    return (
        <div className='color-legend-container'>
            {temperatureRanges.map((point, index) => (
                <div key={index} className='color-legend-item'>
                    <div className='color-legend-color' style={{ backgroundColor: point.color }}></div>
                    <div className='color-legend-label'>
                        <p>{point.temp}°C</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default ColorLegend
