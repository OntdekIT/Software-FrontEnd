import { Oval } from 'react-loader-spinner';
import PropTypes from "prop-types";

const LoadingComponent = ({ message, isFullScreen}) => {
    if (isFullScreen){
        return (
            <div className="loading-overlay-center" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Oval
                    height={40}
                    width={40}
                    color="#4fa94d"
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                />
                {message && <a>{message}</a>}
            </div>
        );
    } else {
        return (
            <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Oval
                        height={40}
                        width={40}
                        color="#4fa94d"
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#4fa94d"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                    {message && <a>{message}</a>}
                </div>
            </div>
        );
    }
};

LoadingComponent.propTypes = {
    message: PropTypes.string,
    isFullScreen: PropTypes.bool.isRequired,
};

export default LoadingComponent;
