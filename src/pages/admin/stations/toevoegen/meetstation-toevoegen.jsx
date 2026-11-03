import { useNavigate } from 'react-router-dom';
import MeetstationForm from '../../../../components/stations/meetstation-form.jsx';

export default function MeetstationToevoegen() {
    const navigate = useNavigate();

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <h4 className="mb-4 flex items-center justify-center gap-2 text-center text-xl font-bold text-gray-900">
                        <i className="bi bi-broadcast" aria-hidden="true"></i>
                        Nieuw Meetstation Toevoegen
                    </h4>
                    <MeetstationForm
                        onSuccess={() => navigate('/admin/stations')}
                        onCancel={() => navigate(-1)}
                    />
                </div>
            </div>
        </div>
    );
}
