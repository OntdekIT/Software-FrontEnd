export default class WorkshopUtils {
    static generateExpirationDate(minutes, startDate = new Date()) {
        const expirationDate = new Date();
        expirationDate.setTime(startDate.getTime() + minutes * 60 * 1000);
        return expirationDate;
    }
}