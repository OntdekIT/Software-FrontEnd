import {Link} from "react-router-dom";

export default function DashboardButton({link, text, icon}) {
    return (
        // <Link to={link}>
        //     <button className="btn btn-lg bg-warning">{text}</button>
        // </Link>

        <div className="card bg-primary">
            <div className="card-body text-center">
                <h1><i className={icon}></i></h1>
                <h4>{text}</h4>
                <Link to={link} className="stretched-link"></Link>
            </div>
        </div>
    );
}