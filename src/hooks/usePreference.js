import { useState, useCallback } from 'react';

/** useState that remembers a harmless UI preference (never financial data). */
export default function usePreference(key, initial) {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) || initial; } catch { return initial; }
  });
  const update = useCallback((v) => {
    setValue(v);
    try { localStorage.setItem(key, v); } catch { /* storage unavailable */ }
  }, [key]);
  return [value, update];
}
