import React, {useState} from 'react';

function RadioButtonGroup(props) {
    const [selectedOption, setSelectedOption] = useState();
    function handleChange(event) {
        setSelectedOption(event.target.value);
        console.log(selectedOption)
    }
    return (
        <div>
            <label>
                <input type="radio" value="option1" checked={selectedOption === 'option1'} onChange={e => {handleChange(e); props.handleToggleShowRegions()}} />
                Regio's
            </label>
            <br />
            <label>
                <input type="radio" value="option2" checked={selectedOption === 'option2'} onChange={e => {handleChange(e); props.handleToggleTemp()}} />
                Temperatuur
            </label>
            <br />
            <label>
                <input type="radio" value="option3" checked={selectedOption === 'option3'} onChange={e => {handleChange(e); props.handleToggleFijnStof()}} />
                Fijnstof
            </label>
        </div>
    );
}

export default RadioButtonGroup;