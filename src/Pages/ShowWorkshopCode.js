import React, { useState, useEffect, useContext } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";
import LoginCheck from "../Components/LoginCheck";

const ADMIN_URL = '/Admin/getworkshopcodes';

const ShowWorkshopCode = () => {
    const [workshopCodes, setWorkshopCodes] = useState([]); // Initialize with empty array
    const { isAdmin } = useContext(LoginCheck);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null); 

    const getData = async () => {
        try {
            const getWorkshopCodes = await api.get(ADMIN_URL, {
                withCredentials: true
            });
            console.log(getWorkshopCodes.data);

            setWorkshopCodes(getWorkshopCodes.data);
            setErrMsg(null);
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            getData();
        } else {
            setLoading(false); // Set loading to false directly if not admin
            console.log("Admin not true");
        }
    }, [isAdmin]);

    // if (!isAdmin) {
    //     window.location.href = "/";
    //     return null; // Prevent rendering
    // }

    return (
        <section className="form-section">
            {loading ? (
                <div>Loading . . .</div>
            ) : (
    <div>
        <title>Workshop Page</title>
        <h1>Workshop code</h1>
        {workshopCodes && workshopCodes.map(workshopCode => (
            <h2 align="center" key={workshopCode.id}>{workshopCode.code}</h2>
        ))}
        <Link to={"/admin"}>
            <button className="btn btn-dark">Terug</button>
        </Link>
    </div>

            )}
        </section>
    )
}

export default ShowWorkshopCode;
