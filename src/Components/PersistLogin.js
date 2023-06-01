//only check the /refresh endpoint when needed, not everytime you enter a protected page

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        let isMounted = true; //using this avoids memory leak

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }
        //if we dont have an access token
        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    //can be removed later, just for logging/checking the isLoading state
    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
    }, [isLoading])

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet/>
            }
        
        </>
    )
}

export default PersistLogin