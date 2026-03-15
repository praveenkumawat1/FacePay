/**
 * AnimatedNumber
 * - Animates a numeric value from 0 to the given value over 2 seconds.
 * - Uses Framer Motion's animate() for smooth transitions.
 * - Formats numbers with Indian locale (en-IN).
 */
import { useEffect, useState } from "react";
import { animate } from "framer-motion";

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState("0");
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    const controls = animate(0, numericValue, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(
          new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }).format(latest),
        );
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span>{displayValue}</span>;
};

export default AnimatedNumber;
