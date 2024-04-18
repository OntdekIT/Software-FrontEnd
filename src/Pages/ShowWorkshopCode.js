import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const ADMIN_URL = '/Admin/createworkshopcode';

const AdminPage = () => {
    const [workshopCode, setWorkshopCode] = useState('');

    useEffect(() => {
        const code = localStorage.getItem('workshopcode');
        setWorkshopCode(code);
        console.log(workshopCode);

    }, []);

    return (
        <section className="form-section">
            <div>
                <title>Workshop Page</title>
                <h1>Workshop code</h1>

                <h2 align="center">{workshopCode}</h2>
            </div>
        </section>
    )
}
export default AdminPage;