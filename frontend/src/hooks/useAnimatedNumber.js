import { useState, useEffect } from "react";

export function useAnimatedNumber(target, duration = 900) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const steps = 36;
    const step = target / steps;
    const interval = duration / steps;
    let val = 0;
    const timer = setInterval(() => {
      val += step;
      if (val >= target) { setCurrent(target); clearInterval(timer); }
      else setCurrent(Math.floor(val));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);

  return current;
}
