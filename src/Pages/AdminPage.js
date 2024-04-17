import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const ADMIN_URL = '/Admin/newworkshopcode';


function GenerateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < length; i++) {
         let newChar = characters.charAt(Math.floor(Math.random() * characters.length));
         randomCode += newChar;
         console.log(newChar)
    }
    console.log(randomCode)

    return randomCode;
}
const AdminPage = () => {
    const [workshopCode, setWorkshopCode] = useState('')
    const [duration, setDuration] = useState(10)
    const [currentDateTime, setCurrentDateTime] = useState(new Date())
    const [expDateTime, setExpDateTime] = useState(new Date())
    const [length, setLength] = useState(6)

    useEffect(() => {
        setCurrentDateTime(new Date());
        const newExpDateTime = currentDateTime;
        newExpDateTime.setMinutes(currentDateTime.getMinutes() + duration);
        setExpDateTime(newExpDateTime);
    }, [duration, length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setWorkshopCode(GenerateRandomCode(length));
        const item = {workshopCode, expDateTime}

        try {
            const response = await api.post(ADMIN_URL, JSON.stringify({
                    // firstName: firstname,
                    // lastName: surname,
                    // password: password,
                    // confirmPassword: confirmPassword,
                    // mailAddress: email
                }),
                {
                    headers: {'Content-Type': 'application/JSON'},
                    withCredentials: false
                });

            console.log(JSON.stringify(response?.data));
        }
        catch (err) {

        }
    }
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