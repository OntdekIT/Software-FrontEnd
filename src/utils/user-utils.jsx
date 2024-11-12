export default class UserUtils {
    static translateRole(isAdmin) {
        return isAdmin ? "Admin" : "Gebruiker";
    }
}