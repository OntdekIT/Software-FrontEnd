import {backendApi} from "../utils/backend-api.jsx";

export async function getUserByIdLoader({params}) {
    try {
        const response = await backendApi.get(`/users/${params.userId}`);
        return {user: response.data};
    } catch (error) {
        console.error("Error fetching data: ", error);
        return {user: null};
    }
}