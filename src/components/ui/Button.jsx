import PropTypes from 'prop-types';

const VARIANTS = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus-visible:ring-brand-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-800 focus-visible:ring-gray-400',
    ghost: 'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-300',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

// Shared button used across the app (replaces react-bootstrap Button and
// raw .btn markup). Behaviour is a plain <button>; styling via Tailwind.
export default function Button({
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
    disabled = false,
    children,
    ...rest
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline', 'ghost']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.node,
};
