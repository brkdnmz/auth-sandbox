import { useEffect, useState } from "react";

export function useForceRender(seconds: number) {
  const [, setState] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setState((prev) => prev + 1),
      seconds * 1000, // My life had been demolished not multiplying by 1000 here, fork this shirt!
    );
    return () => clearInterval(interval);
  }, [seconds]);
}
