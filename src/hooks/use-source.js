import {useCallback, useEffect, useState} from "react";

// Loads one data source on its own: {state: "loading" | "ok" | "error", data, reload}.
// `load(signal)` must return a promise. Keep `load` stable (module level or
// useCallback), a new function triggers a new request.
//
// Optional `peek()` (stable, synchronous) returns a cached {data, savedAt} or
// null. With a hit the source starts as "ok" with `fromCache: true` and the
// real request refreshes it in the background; a failed refresh keeps the
// cached data instead of turning into an error.
const fromPeek = (peek) => {
    const cached = peek ? peek() : null;
    return cached
        ? {state: "ok", data: cached.data, fromCache: true, savedAt: cached.savedAt}
        : {state: "loading", data: null};
};

export default function useSource(load, enabled = true, peek = null) {
    const [result, setResult] = useState(() => fromPeek(peek));
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!enabled) return undefined;
        let cancelled = false;
        const controller = new AbortController();
        setResult(fromPeek(peek));
        load(controller.signal)
            .then((data) => !cancelled && setResult({state: "ok", data, fromCache: false}))
            .catch(() => !cancelled && setResult((prev) => (prev.fromCache ? prev : {state: "error", data: null})));
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [load, enabled, attempt, peek]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return {...result, reload};
}
