//import React from 'react'
import { Link } from "react-router-dom"

// export default function ErrorPage() {
//   return (
//     <div>ErrorPage</div>
//   )
// }

const ErrorPage = () => {
    return (
        <article style={{ padding: "100px" }}>
            <h1>Oops!</h1>
            <p>Page Not Found</p>
            <div className="flexGrow">
                <Link to="/">Visit Our Homepage</Link>
            </div>
        </article>
    )
}

export default ErrorPage