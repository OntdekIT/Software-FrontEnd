import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import LoadingComponent from "../../../components/loading-component.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";
import UserFilters from "../../../components/users/user-filters.jsx";
import FilterButton from "../../../components/filter-button.jsx";
import DeleteUserModal from "../../../components/users/delete-user-modal.jsx";

export default function UserOverview() {
    const modalTypes = {
        EDIT: "EDIT",
        DELETE: "DELETE"
    };

    const [users, setUsers] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({});
    const [selectedModalType, setSelectedModalType] = useState(modalTypes.EDIT);

    const getAllUsers = async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
                    if (Array.isArray(filters[key])) {
                        if (filters[key].length > 0) {
                            queryParams.append(key, filters[key].join(","));
                        }
                    } else {
                        queryParams.append(key, filters[key]);
                    }
                }
            });

            const response = await backendApi.get(`/users?${queryParams.toString()}`, {
                withCredentials: true
            });

            setUsers(response.data);
            setErrMsg(null);
        } catch (err) {
            let errorMessage = err.message;

            if (err.response?.status === 404) {
                errorMessage = "Geen gebruikers gevonden";
            }

            setErrMsg(errorMessage);
            setUsers([]);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    const getLoggedInUserId = async () => {
        try {
            const response = await backendApi.get("/my-account", {
                withCredentials: true
            });

            setLoggedInUserId(response.data.id);
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        }
    }

    const onFiltersChanged = (filters) => {
        setFilters(filters);
        console.log(filters);

        getAllUsers(filters).then();
    }

    const clearAllFilters = () => {
        setFilters({});
        getAllUsers().then();
    }

    const handleModalClose = () => {
        setSelectedUser(null);
    }

    const handleUsersChanged = () => {
        setSelectedUser(null);
        getAllUsers(filters).then();
    }

    const handleEditButtonClick = (user) => {
        setSelectedModalType(modalTypes.EDIT);
        setSelectedUser(user);
    }

    const handleDeleteButtonClick = (user) => {
        setSelectedModalType(modalTypes.DELETE);
        setSelectedUser(user);
    }

    useEffect(() => {
        getAllUsers().then();
        getLoggedInUserId().then();
    }, []);

    return (
        <>
            {/*Filter offcanvas*/}
            <div className="offcanvas offcanvas-start" tabIndex="-1" id="userFilterOffcanvas"
                 aria-labelledby="userFilterOffcanvasLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="userFilterOffcanvasLabel">Filters</h5>
                    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <UserFilters onFiltersChange={onFiltersChanged} filters={filters}/>
                </div>
            </div>
            <div className="toolbar fixed-top d-flex justify-content-end align-items-center d-xxl-none">
                <FilterButton areFiltersActive={false} targetId={"userFilterOffcanvas"}/>
            </div>
            <div className="container-fluid">
                <div className="row">
                    {/* Large screen filters */}
                    <div className="d-none d-xxl-block col-xxl-2 border-end full-height-sidebar shadow-sm">
                        <h2>Filters</h2>
                        <UserFilters filters={filters} onFiltersChange={onFiltersChanged}
                                     clearAllFilters={clearAllFilters}/>
                    </div>
                    <div className="col-12 col-xxl-10 offset-xxl-2">
                        <div className="nav-size d-block d-xxl-none"></div>
                        <h1 className="page-header-margin text-center">Gebruikers</h1>
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        {loading && (
                            <LoadingComponent message="Gebruikers aan het ophalen..."
                                              isFullScreen={true}></LoadingComponent>
                        )}
                        {!loading && (users?.length > 0) && (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th scope="col">Naam</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Rol</th>
                                        <th scope="col">Acties</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users && users.map(user => (
                                        <tr key={user.id}>
                                            <td>{`${user.firstName} ${user.lastName}`}</td>
                                            <td>{user.email}</td>
                                            <td>{user.isAdmin ? "Admin" : "Gebruiker"}</td>
                                            <td>
                                                {user.id !== loggedInUserId &&
                                                    <div className="d-flex">
                                                        <button className="btn btn-outline-dark btn-sm"
                                                                onClick={() => handleEditButtonClick(user)}>
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button className="btn btn-outline-danger btn-sm ms-2"
                                                                onClick={() => handleDeleteButtonClick(user)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>}
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
            {selectedUser && selectedModalType === modalTypes.EDIT &&
                <EditUserRoleModal user={selectedUser} isShown={true} onClose={handleModalClose}
                                   onRoleChanged={handleUsersChanged}/>}
            {selectedUser && selectedModalType === modalTypes.DELETE &&
                <DeleteUserModal user={selectedUser} isShown={true} onClose={handleModalClose}
                                 onUserDeleted={handleUsersChanged}/>}
        </>
    );
}