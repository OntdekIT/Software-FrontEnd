import UserRole from "../domain/user-role.jsx";

export default class UserUtils {
    static translateRole(role) {
        switch (role) {
            case UserRole.USER:
                return "Gebruiker";
            case UserRole.ADMIN:
                return "Administrator";
            case UserRole.SUPER_ADMIN:
                return "Super admin";
            default:
                return "Onbekend";
        }
    }
}