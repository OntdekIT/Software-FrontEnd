import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import LoadingComponent from "../../../components/loading-component.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";

export default function UserOverview() {
    const [users, setUsers] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const SUPERADMIN_ID = 1;

    const getAllUsers = async () => {
        try {
            //TODO: Change to correct endpoint when available
            const response = await backendApi.get("/User", {
                withCredentials: true
            });

            setUsers(response.data);
            setErrMsg(null);
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    const getLoggedInUserId = async () => {
        try {
            const response = await backendApi.get("/User/getID", {
                withCredentials: true
            });

            setLoggedInUserId(response.data);
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        }
    }

    const handleEditUserRoleModalClose = () => {
        setSelectedUser(null);
    }

    const handleUserRoleChanged = () => {
        setSelectedUser(null);
        getAllUsers().then();
    }

    const handleEditButtonClick = (user) => {
        setSelectedUser(user);
    }

    useEffect(() => {
        getAllUsers().then();
        getLoggedInUserId().then();
    }, []);

    return (
        <>
            <div className="toolbar fixed-top d-flex justify-content-between align-items-center">
                <button className="btn btn-primary btn-sm ms-auto"><i className="bi bi-funnel"></i></button>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col text-center">
                        <div className="nav-size"></div>
                        <h1>Gebruikers</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        {loading ? (
                            <LoadingComponent message="Gebruikers aan het ophalen..."
                                              isFullScreen={true}></LoadingComponent>
                        ) : (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th scope="col">Naam</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Admin</th>
                                        <th scope="col">Acties</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users && users.map(user => (
                                        <tr key={user.id}>
                                            <td>{`${user.firstName} ${user.lastName}`}</td>
                                            <td>{user.mailAddress}</td>
                                            <td>{user.admin ? "Ja" : "Nee"}</td>
                                            <td>
                                                {user.id !== SUPERADMIN_ID && user.id !== loggedInUserId &&
                                                    <button className="btn btn-outline-dark btn-sm" onClick={() => handleEditButtonClick(user)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {selectedUser && <EditUserRoleModal user={selectedUser} isShown={true} onClose={handleEditUserRoleModalClose} onRoleChanged={handleUserRoleChanged} />}
        </>
    );
}