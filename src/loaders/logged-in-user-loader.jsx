import {backendApi} from "../utils/backend-api.jsx";

export async function isLoggedInUserLoader() {
    let isLoggedIn = false;
    try {
        const response = await backendApi.get(`/Authentication/checkLogin`, {
            withCredentials: true
        });

        if (response.data) {
            console.log(response.data);
            isLoggedIn = true;
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    if (!isLoggedIn) {
        throw new Error("Unauthorized");
    }

    return isLoggedIn;
}