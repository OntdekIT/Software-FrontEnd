import {Link} from "react-router-dom";
import PropTypes from "prop-types";

export default function DashboardButton({link, text, icon}) {
    return (
        <div className="card bg-primary zoom">
            <div className="card-body text-center">
                <h1><i className={icon}></i></h1>
                <h4>{text}</h4>
                <Link to={link} className="stretched-link"></Link>
            </div>
        </div>
    );
}

DashboardButton.propTypes = {
    link: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
}