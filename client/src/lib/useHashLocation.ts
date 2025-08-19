import { useState, useEffect } from "react";
import type { Path } from "wouter";

// Custom hook for hash-based routing
export function useHashLocation(): [Path, (path: Path) => void] {
  const getHashPath = () =>
    window.location.hash.replace(/^#/, "") || "/";

  const [loc, setLoc] = useState<Path>(getHashPath());

  useEffect(() => {
    const handler = () => setLoc(getHashPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (path: Path) => {
    window.location.hash = path;
  };

  return [loc, navigate];
}
