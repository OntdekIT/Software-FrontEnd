import React, { useState } from 'react';

const Checkbox = (props) => {
    const [checked, setChecked] = useState(false);
    const handleChange = () => {
        setChecked(!checked);
    }
    return (
        <div>
            <label>
                <input type="checkbox" checked={checked} onChange={e => {handleChange(); props.handleToggleShowDataStations();}} />
                Meetstations
            </label>
        </div>
    )
}

export default Checkbox;