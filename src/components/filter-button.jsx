import PropTypes from "prop-types";
import Button from "./ui/Button.jsx";

// Opens the filter panel. Bootstrap's offcanvas JS was removed in the Tailwind
// migration, so this is now a plain onClick the parent wires to open state.
export default function FilterButton({ areFiltersActive, onClick }) {
    return (
        <Button
            type="button"
            variant={areFiltersActive ? "secondary" : "primary"}
            size="sm"
            onClick={onClick}
            aria-label="Filters openen"
        >
            <i className="bi bi-funnel"></i>
        </Button>
    );
}

FilterButton.propTypes = {
    areFiltersActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};
