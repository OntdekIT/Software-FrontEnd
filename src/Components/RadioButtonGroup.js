import React, { useState } from 'react';

const RadioButtonGroup = (props) => {
    const [selectedOption, setSelectedOption] = useState("wijk");
    function handleChange(event) {
        setSelectedOption(event.target.value);
    }
    return (
        <div>
            <label>
                <input type="radio" value="wijk" checked={selectedOption === 'wijk'} onChange={e => { handleChange(e); props.handleToggleShowRegions() }} />
                Wijken
            </label>
            <br />
            <label>
                <input type="radio" value="heatmap" checked={selectedOption === 'heatmap'} onChange={e => { handleChange(e); props.handleToggleTemp() }} />
                Heatmap
            </label>
            <br />
        </div>
    );
}

export default RadioButtonGroup;