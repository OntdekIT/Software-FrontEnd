import {backendApi} from "../utils/backend-api.jsx";

export async function isAdminLoader() {
    let isAdmin = false;
    try {
        const response = await backendApi.get(`/User/checkAdmin`, {
            withCredentials: true
        });

        if (response.data) {
            console.log(response.data);
            isAdmin = true;
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    if (!isAdmin) {
        throw new Error("Forbidden");
    }

    return isAdmin;
}