import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <main className="App">
            {/* represents all the children of the layout component, header and footer component can be added! */}
            <Outlet/>
        </main>
    )
}

export default Layout