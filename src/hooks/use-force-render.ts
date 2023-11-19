import { useEffect, useState } from "react";

export function useForceRender(seconds: number) {
  const [, setState] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setState((prev) => prev + 1), seconds);
    return () => clearInterval(interval);
  }, [seconds]);
}
