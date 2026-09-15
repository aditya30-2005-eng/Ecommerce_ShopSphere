import { useEffect, useState } from 'react';

// Debounces a fast-changing value (e.g. a search input) so we don't fire
// an API request on every keystroke.
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
