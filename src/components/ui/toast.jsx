import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

const STYLES = {
    success: 'border-brand-500 bg-brand-50 text-brand-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800',
    warning: 'border-amber-500 bg-amber-50 text-amber-800',
};

const ICONS = {
    success: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
    error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
    info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    warning: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z',
};

// Wrap the app once. Exposes addToast via useToast(); renders the stack itself.
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const addToast = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
        // Derive an id without Math.random/Date to stay deterministic-friendly.
        setToasts((t) => {
            const id = (t[t.length - 1]?.id ?? 0) + 1;
            const next = [...t, { id, message, type }];
            if (duration) setTimeout(() => remove(id), duration);
            return next;
        });
    }, [remove]);

    const value = useMemo(() => ({
        addToast,
        success: (m, o) => addToast(m, { ...o, type: 'success' }),
        error: (m, o) => addToast(m, { ...o, type: 'error' }),
        info: (m, o) => addToast(m, { ...o, type: 'info' }),
        warning: (m, o) => addToast(m, { ...o, type: 'warning' }),
    }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-full max-w-sm flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="status"
                        className={`pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-white p-3 shadow-lg ${STYLES[t.type] ?? STYLES.info}`}
                    >
                        <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d={ICONS[t.type] ?? ICONS.info} clipRule="evenodd" />
                        </svg>
                        <p className="flex-1 text-sm">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="shrink-0 text-current/60 hover:text-current"
                            aria-label="Sluiten"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

ToastProvider.propTypes = { children: PropTypes.node };

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}
