import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const ADMIN_URL = '/Admin/createworkshopcode';

const AdminPage = () => {
    const [workshopCode, setWorkshopCode] = useState('');
    const [duration, setDuration] = useState(10);
    const [length, setLength] = useState(6);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(ADMIN_URL, { duration, length },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });

            console.log(JSON.stringify(response?.data));
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <section className="form-section">
            <div>
                <title>Admin Page</title>
                <h1>New workshop code</h1>
                <form onSubmit={handleSubmit}>
                    <label>Lengte code: </label>
                    <input
                        type="number"
                        required
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                    />
                    <label>Geldig (min):</label>
                    <input
                        type="number"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                    <button>Create code</button>
                </form>
                <h3>{workshopCode}</h3>
            </div>
        </section>
    )
}
export default AdminPage;