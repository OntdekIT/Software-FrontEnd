import PropTypes from "prop-types";

export default function FilterButton({ areFiltersActive, targetId }) {
    return (
        <button
            type="button"
            className={`btn btn-sm ${areFiltersActive ? "btn-secondary" : "btn-primary"}`}
            data-bs-toggle="offcanvas"
            data-bs-target={`#${targetId}`}
            aria-controls={targetId}
        >
            <i className="bi bi-funnel"></i>
        </button>
    );
}

FilterButton.propTypes = {
    areFiltersActive: PropTypes.bool.isRequired,
    targetId: PropTypes.string.isRequired
};