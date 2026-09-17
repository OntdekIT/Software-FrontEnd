import './new-heatmap.css';
import NewMap from "../components/newmap.jsx";

export default function Home() {
    return (
        <>
            <title>Heatmap</title>

            <div className="heatmap-container">
                <NewMap centerX={5.0913} centerY={51.5555} zoom={12} ></NewMap>
            </div>
        </>
    );
}
