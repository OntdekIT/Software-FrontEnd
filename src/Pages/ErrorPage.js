import { Link } from "react-router-dom"

const ErrorPage = () => {
    return (
        <article style={{ padding: "100px" }}>
            <title>Oops!</title>
            <h1>Oops!</h1>
            <p>Page Not Found</p>
            <div className="flexGrow">
                <Link to="/">Visit Our Homepage</Link>
            </div>
        </article>
    )
}

export default ErrorPage