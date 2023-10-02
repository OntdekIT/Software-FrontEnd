import { useNavigate, Link } from 'react-router-dom';
import useLogout from "../Hooks/useLogout";
//import Users from './Users';

const Admin = () => {
    const navigate = useNavigate();
    const logout = useLogout();

    const signOut = async () => {
        await logout();
        navigate('/login');
    }

    return (
        <section>
            <h1>Admins Page</h1>
            <br />
            {/*<Users /> dit is een crud component (get all) */}
            <br />
            <div className="flexGrow">
                <Link to="/">Home</Link>
            </div>
            <div className="flexGrow">
                <button onClick={signOut}>Sign Out</button>
            </div>
        </section>
    )
}

export default Admin