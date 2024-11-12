import {backendApi} from "../utils/backend-api.jsx";

export async function getUserByIdLoader({request, params}) {
    try {
        const url = new URL(request.url);
        const queryParams = new URLSearchParams(url.search);
        let uri = `/users/${params.userId}`;

        if (Array.from(queryParams.keys()).length > 0) {
            uri += `?${queryParams.toString()}`;
        }

        const response = await backendApi.get(uri);

        return {user: response.data};
    } catch (error) {
        console.error("Error fetching data: ", error);
        return {user: null};
    }
}
