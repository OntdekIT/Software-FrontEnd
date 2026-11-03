import { useState, useCallback } from "react";

export function useChartZoom() {
  const [range, setRange] = useState(null); // { from, to } = tijdstempels uit de data, null = alles
  const [hidden, setHidden] = useState(new Set());
  const [version, setVersion] = useState(0);

  const toggleLine = useCallback((key) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setRange(null);
    setHidden(new Set());
    setVersion((v) => v + 1);
  }, []);

  const clearRange = useCallback(() => {
    setRange(null);
    setVersion((v) => v + 1);
  }, []);

  return { range, setRange, hidden, toggleLine, reset, clearRange, version };
}