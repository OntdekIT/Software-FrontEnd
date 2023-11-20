import React, {useState} from "react";

const Radiobutton = ({data, handleChange, current}) =>{
    const [selectedOption, setSelectedOption] = useState(current.charAt(0).toUpperCase() + current.substring(1));

    if (data === null || data === undefined || data[0] === null || data[0] === undefined){
        return <></>
    }

    let fieldNames = Object.keys(data[0]);

    for (let i = 0; i < fieldNames.length; i++){
        fieldNames[i] = fieldNames[i].charAt(0).toUpperCase() + fieldNames[i].substring(1);
    }

    const results = [];
    fieldNames.forEach(fieldName => {
        console.log(fieldName);
        if (fieldName === "Temperature" || fieldName === 'Humidity') {
            results.push(
                <div>
                    <label>
                        <input type="radio" value={fieldName} checked={selectedOption === fieldName}
                               onChange={e => {
                                   handleChange(fieldName.toLowerCase());
                                   setSelectedOption(fieldName);
                               }}/>
                            { fieldName }
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