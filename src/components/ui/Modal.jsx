import { useEffect } from 'react';
import PropTypes from 'prop-types';

// Shared modal (replaces react-bootstrap Modal). Renders an overlay + centered
// panel; closes on backdrop click and Escape. Controlled via `show`/`onClose`.
export default function Modal({ show, onClose, title, children, footer, size = 'md' }) {
    useEffect(() => {
        if (!show) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [show, onClose]);

    if (!show) return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`w-full ${widths[size] ?? widths.md} rounded-xl bg-white shadow-xl`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Sluiten"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
                <div className="px-5 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">{footer}</div>}
            </div>
        </div>
    );
}

Modal.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    title: PropTypes.node,
    children: PropTypes.node,
    footer: PropTypes.node,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};
