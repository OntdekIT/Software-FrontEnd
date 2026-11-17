import {useCallback, useEffect, useState} from "react";

// Loads one data source on its own: {state: "loading" | "ok" | "error", data, reload}.
// `load(signal)` must return a promise. Keep `load` stable (module level or
// useCallback), a new function triggers a new request.
export default function useSource(load, enabled = true) {
    const [result, setResult] = useState({state: "loading", data: null});
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!enabled) return undefined;
        let cancelled = false;
        const controller = new AbortController();
        setResult({state: "loading", data: null});
        load(controller.signal)
            .then((data) => !cancelled && setResult({state: "ok", data}))
            .catch(() => !cancelled && setResult({state: "error", data: null}));
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [load, enabled, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return {...result, reload};
}
