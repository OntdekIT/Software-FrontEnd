import {Link, useLoaderData, useNavigate} from "react-router-dom";
import {useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";
import DeleteUserModal from "../../../components/users/delete-user-modal.jsx";
import UserUtils from "../../../utils/user-utils.jsx";

export default function UserDetails() {
    const {user} = useLoaderData();
    const navigate = useNavigate();

    const modalTypes = {
        EDIT: "EDIT",
        DELETE: "DELETE"
    };

    const [showSelectedModal, setshowSelectedModal] = useState(false);
    const [selectedModalType, setSelectedModalType] = useState(modalTypes.EDIT);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const handleModalClose = () => {
        setshowSelectedModal(false);
    }

    const handleUserChanged = () => {
        window.location.reload();
    }

    const handleUserDeleted = () => {
        navigate("/admin/users");
    }

    const handleEditButtonClick = () => {
        setSelectedModalType(modalTypes.EDIT);
        setshowSelectedModal(true);
    }

    const handleDeleteButtonClick = () => {
        setSelectedModalType(modalTypes.DELETE);
        setshowSelectedModal(true);
    }

    const getLoggedInUser = async () => {
        try {
            const response = await backendApi.get("/my-account", {
                withCredentials: true
            });

            setLoggedInUser(response.data);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/auth/login")
            }
        }
    }

    return(
        <>
            <div className="toolbar fixed-top d-flex align-items-center">
                <p className="flex-grow-1 mb-0">{user.firstName} {user.lastName}</p>
                <button className="btn btn-primary btn-sm ms-2"
                        onClick={() => handleEditButtonClick()}>
                    <i className="bi bi-pencil"></i></button>
                <button className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleDeleteButtonClick()}>
                    <i className="bi bi-trash"></i></button>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="nav-size"></div>
                        <div className="card page-header-margin">
                            <div className="card-header">
                                Algemene informatie
                            </div>
                            <div className="card-body d-flex flex-column">
                                <span><b>Naam: </b> {user.firstName} {user.lastName}</span>
                                <span><b>E-mailadres: </b> {user.email}</span>
                                <span><b>Rol: </b> {UserUtils.translateRole(user.isAdmin)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                    {selectedModalType === modalTypes.EDIT &&
                        <EditUserRoleModal user={user} isShown={showSelectedModal} onClose={handleModalClose}
                                           onRoleChanged={handleUserChanged}/>}
                    {selectedModalType === modalTypes.DELETE &&
                        <DeleteUserModal user={user} isShown={showSelectedModal} onClose={handleModalClose}
                                         onUserDeleted={handleUserDeleted}/>}
                </>
                );
                }