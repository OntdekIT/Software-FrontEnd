import {useState} from "react";
import PropTypes from "prop-types";

export default function Checkbox (props) {
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
    );
}

Checkbox.propTypes = {
    handleToggleShowDataStations: PropTypes.func.isRequired,
};