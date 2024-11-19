import {backendApi} from "../utils/backend-api.jsx";
import UserRole from "../domain/user-role.jsx";

export async function isAdminLoader() {
    let isAdmin = false;
    try {
        const response = await backendApi.get(`/my-account`, {
            withCredentials: true
        });

        if (response.data?.role) {
            isAdmin = response.data.role === UserRole.ADMIN || response.data.role === UserRole.SUPER_ADMIN;
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    if (!isAdmin) {
        throw new Error("Forbidden");
    }

    return isAdmin;
}