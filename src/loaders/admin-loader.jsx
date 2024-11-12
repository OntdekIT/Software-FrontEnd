import {backendApi} from "../utils/backend-api.jsx";

export async function isAdminLoader() {
    let isAdmin = false;
    try {
        const response = await backendApi.get(`/my-account`, {
            withCredentials: true
        });

        if (response.data?.isAdmin) {
            isAdmin = response.data.isAdmin;
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    if (!isAdmin) {
        throw new Error("Forbidden");
    }

    return isAdmin;
}