import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";

export default function CreateWorkshopCode() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onChange"
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setErrMsg('');
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        setErrMsg('');
        try {
            const body = {
                duration: data.duration,
                length: 6
            }

            const response = await backendApi.post("/Admin/createworkshopcode", body,
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                });

            if (response?.status === 200) {
                localStorage.setItem('workshopcode', response.data);
                navigate("/admin/workshop-codes");
            }
        } catch (err) {
            console.error('Error:', err);
            setErrMsg('Er is iets misgegaan');
            setLoading(false);

            if (err.response?.status === 401) {
                navigate("/auth/login");
            }
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <h1 className="page-header-margin text-center">Workshopcode aanmaken</h1>
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        <p className="text-center">Hier kan een workshopcode aangemaakt worden. De code wordt gegenereerd met willekeurige
                            cijfers</p>

                        <div className="form-floating mb-3">
                            <select className={`form-select ${errors.duration ? 'is-invalid' : ''}`}
                                    id="duration" {...register("duration", {required: true, valueAsNumber: true})}>
                                <option value={''} selected={true}>Kies hoelang de code geldig is</option>
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={60}>60 min</option>
                                <option value={120}>2 uur</option>
                                <option value={240}>4 uur</option>
                                <option value={720}>12 uur</option>
                                <option value={1440}>1 dag</option>
                                <option value={4320}>3 dagen</option>
                                <option value={2880}>1 week</option>
                            </select>
                            <label htmlFor="duration" className="form-label">Geldigheidsduur</label>
                            {errors.duration && <div className="invalid-feedback">Geldigheidsduur is verplicht</div>}
                        </div>
                        <div className="d-grid mb-2">
                            <button className="btn btn-lg btn-primary"
                                    disabled={loading}>
                                Workshopcode aanmaken
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}