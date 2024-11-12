import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import LoadingComponent from "../../../components/loading-component.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";
import UserFilters from "../../../components/users/user-filters.jsx";
import FilterButton from "../../../components/filter-button.jsx";
import DeleteUserModal from "../../../components/users/delete-user-modal.jsx";
import {Link, useNavigate} from "react-router-dom";
import UserUtils from "../../../utils/user-utils.jsx";

export default function UserOverview() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({});


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

    const onFiltersChanged = (filters) => {
        setFilters(filters);
        console.log(filters);

        getAllUsers(filters).then();
    }

    const clearAllFilters = () => {
        setFilters({});
        getAllUsers().then();
    }

    const navigateToDetails = (user) => {
        navigate(`./${user.id}`);
    }

    useEffect(() => {
        getAllUsers().then();
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
                                <table className="table table-hover">
                                    <thead>
                                    <tr>
                                        <th scope="col">Naam</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Rol</th>
                                        <th scope="col"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users && users.map(user => (
                                        <tr key={user.id} onClick={() => navigateToDetails(user)} className="cursor-pointer">
                                            <td>{`${user.firstName} ${user.lastName}`}</td>
                                            <td>{user.email}</td>
                                            <td>{UserUtils.translateRole(user.isAdmin)}</td>
                                            <td>
                                                <Link to={`./${user.id}`} className="btn btn-sm btn-outline-dark"><i
                                                    className="bi bi-arrow-right"></i></Link>
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

        </>
    );
}