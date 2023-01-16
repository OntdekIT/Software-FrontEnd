import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from '../api/axios';
import {useCookies} from "react-cookie";


const url = '/Authentication/verify';

const Verify = () => {
    const { linkHash, email } = useParams();
    const [error, setError] = useState(null);
   const [cookies, setCookies, removeCookies] = useCookies();
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get(url , { params : {linkHash, email} });
                console.log(response);
                let expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + 7);
                setCookies("firstName", response.data.firstName, {path: "/", expires: expireTime});
                setCookies("JWT", response.data.jwsString, {path: "/", expires: expireTime});
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        };
        getData();  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    
    return (
        <section>
            <div className="success-msg">Gebruiker ingelogd</div>
            <p>Hi {cookies.firstName}</p>
            <p>{error}</p>
            <p>linkHash: {linkHash}</p>
            <br/>
            <p>email: {email}</p>
            <br/>
            <p>back end link: http://localhost:8080/api/Authentication/verify?linkHash={linkHash}&email={email}</p>
        </section>
    );
}
 
export default Verify;