import { useEffect, useState } from "react";

export function useWindowSize() {
  const getSize = () => ({ width: typeof window === "undefined" ? 1280 : window.innerWidth, height: typeof window === "undefined" ? 800 : window.innerHeight });
  const [size, setSize] = useState(getSize);
  useEffect(() => {
    const handler = () => setSize(getSize());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}
