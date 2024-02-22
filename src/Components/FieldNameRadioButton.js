import React, {useState} from "react";

const Radiobutton = ({data, handleChange, current}) =>{
    const [selectedOption, setSelectedOption] = useState(current);

    //makes sure there is data
    if (data === null || data === undefined || data[0] === null || data[0] === undefined){
        return <></>
    }

    let fieldNames = Object.keys(data[0]);

    const results = [];
    fieldNames.forEach(fieldName => {
        //excludes fields that should not get shown
        if (fieldName !== 'id' && fieldName !== 'latitude' && fieldName !== 'longitude' && fieldName !== 'timestamp') {
            results.push(
                <div>
                    <label>
                        <input type="radio" value={fieldName} checked={selectedOption === fieldName}
                               onChange={e => {
                                   handleChange(fieldName.toLowerCase());
                                   setSelectedOption(fieldName);
                               }}/>
                            { fieldName.charAt(0).toUpperCase() + fieldName.substring(1) }
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
    )
}
export default Radiobutton;