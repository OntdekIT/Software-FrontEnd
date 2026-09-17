import DashboardButton from "../../components/dashboard-button.jsx";

export default function AdminDashboard() {
    return (
        <>
            <div className="mx-auto max-w-5xl px-4">
                <h1 className="mb-6 mt-4 text-center text-2xl font-bold">Beheer</h1>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <DashboardButton link={"/admin/workshop-codes"} text={"Workshopcodes"}
                                         icon={"bi bi-123"}></DashboardButton>
                    </div>
                    <div>
                        <DashboardButton link={"/admin/users"} text={"Gebruikers"}
                                         icon={"bi bi-person"}></DashboardButton>
                    </div>
                    <div>
                        <DashboardButton link={"/admin/stations"} text={"Stations"}
                                         icon={"bi bi-graph-up"}></DashboardButton>
                    </div>
                </div>
            </div>
        </>
    )
}