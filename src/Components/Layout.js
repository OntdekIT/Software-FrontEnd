import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const Layout = () => {
    return (
        <div className="layout-container" style={{width: "100%"}}>
            <NavBar />
            {/* represents all the children of the layout component, header and footer component can be added! */}
            <Outlet />
        </div>
    )
}

export default Layout