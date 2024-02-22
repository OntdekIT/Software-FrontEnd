import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({}); //empty out current user
    }

    return logout;
}

export default useLogout