import { useEffect } from 'react';

/**
 * A custom hook that triggers a callback when a click is detected outside of the referenced element.
 * @param {React.RefObject} ref - The ref of the element to detect outside clicks for.
 * @param {Function} handler - The callback function to execute.
 */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if the click is inside the ref's element or its descendants
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run effect if ref or handler changes
}

export default useClickOutside;