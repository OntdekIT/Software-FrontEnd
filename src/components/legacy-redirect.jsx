import PropTypes from 'prop-types';
import { Navigate, useParams } from 'react-router-dom';
import { fillPath } from '../utils/legacy-routes.js';

// Stuurt een oude route met parameters door, bijvoorbeeld /wijken/:id naar /wijk/:id.
export default function LegacyRedirect({ to }) {
    return <Navigate to={fillPath(to, useParams())} replace />;
}

LegacyRedirect.propTypes = {
    to: PropTypes.string.isRequired,
};
