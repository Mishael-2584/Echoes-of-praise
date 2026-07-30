import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll to top on every client-side navigation. */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}
