import {Link, useNavigate} from "react-router-dom";
import Button from "../../../components/ui/Button.jsx";
import WorkshopCodeForm from "../../../components/workshop/workshop-code-form.jsx";

export default function CreateWorkshopCode() {
    const navigate = useNavigate();

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="mx-auto w-full max-w-lg">
                <div className="mb-4">
                    <Link to="/admin/workshop-codes">
                        <Button variant="ghost" size="sm">
                            <i className="bi bi-arrow-left"></i>
                            Terug
                        </Button>
                    </Link>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="flex items-center justify-center gap-2 text-center text-3xl font-bold">
                        <i className="bi bi-plus-circle text-brand-500"></i>
                        Workshopcode aanmaken
                    </h1>
                    <WorkshopCodeForm onSuccess={() => navigate("/admin/workshop-codes")}/>
                </div>
            </div>
        </div>
    );
}
