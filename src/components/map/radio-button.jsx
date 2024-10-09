import {useState} from "react";
import PropTypes from "prop-types";

export default function RadioButton({data, handleChange, current}) {
    const [selectedOption, setSelectedOption] = useState(current);

    //makes sure there is data
    if (data === null || data === undefined || data[0] === null || data[0] === undefined) {
        return <></>
    }

    let fieldNames = Object.keys(data[0]);

    const results = [];
    fieldNames.forEach(fieldName => {
        //excludes fields that should not get shown
        if (fieldName !== 'id' && fieldName !== 'latitude' && fieldName !== 'longitude' && fieldName !== 'timestamp' && fieldName !== 'is_public' && fieldName !== 'userId') {
            results.push(
                <div>
                    <label>
                        <input type="radio" value={fieldName} checked={selectedOption === fieldName}
                               onChange={() => {
                                   handleChange(fieldName.toLowerCase());
                                   setSelectedOption(fieldName);
                               }}/>
                        {fieldName.charAt(0).toUpperCase() + fieldName.substring(1)}
                    </label>
                    <br/>
                </div>
            )
        }
    })
    console.log(fieldNames);

    return (
        <div>
            {results}
        </div>
    );
}

RadioButton.propTypes = {
    data: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
    current: PropTypes.string.isRequired,
};
