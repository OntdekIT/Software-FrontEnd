import {Link} from "react-router-dom";
import PropTypes from "prop-types";

export default function DashboardButton({link, text, icon}) {
    return (
        <div className="relative rounded-xl bg-brand-500 p-4 text-white shadow-sm transition-transform duration-200 hover:scale-105 hover:bg-brand-600">
            <div className="text-center">
                <h1 className="text-4xl"><i className={icon}></i></h1>
                <h4 className="text-lg font-semibold">{text}</h4>
                <Link to={link} className="absolute inset-0" aria-label={text}></Link>
            </div>
        </div>
    );
}

DashboardButton.propTypes = {
    link: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
}
