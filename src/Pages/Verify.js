import { useEffect } from "react";
import { api } from "../App";

const VERIFY_URL = '/Authentication/verify';

const Verify = () => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const linkHash = urlParams.get('linkHash');
        const email = urlParams.get('email');

        // Check if linkHash and email are present in the URL
        if (linkHash && email) {
            verifyLink(linkHash, email);
        }
    }, []);

    const verifyLink = async (linkHash, email) => {
        let response;
        try {
            response = await api.post(VERIFY_URL, JSON.stringify({ linkHash, email }), {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });

            if (response?.status === 200) {
                console.log("Succes");
            }
        } catch (err) {
            console.log(err.message);
        }
        console.log(response);
    };

    return (
        <div>
            { "pls wait uwu" }
        </div>
    );
}

export default Verify;