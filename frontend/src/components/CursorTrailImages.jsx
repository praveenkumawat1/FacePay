/**
 * CursorTrailImages
 * - Creates a trail of images that follow the mouse cursor inside its container.
 * - Images fade in/out and are automatically removed after 2 seconds.
 * - Used in the hero section to add interactive visual flair.
 */
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CursorTrailImages = () => {
  const containerRef = useRef(null);
  const [trails, setTrails] = useState([]);
  const trailIndex = useRef(0);

  // Predefined images with alt text
  const images = [
    {
      src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      alt: "Face Recognition",
    },
    {
      src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
      alt: "Secure Payment",
    },
    // ... and so on up to 8 images
  ]; // (same as original)

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let throttleTimer = null;

    const handleMouseMove = (e) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 100);

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newTrail = {
        id: Date.now() + Math.random(),
        x,
        y,
        image: images[trailIndex.current % images.length],
        rotation: (Math.random() - 0.5) * 30,
      };

      trailIndex.current += 1;
      setTrails((prev) => [...prev, newTrail].slice(-12));
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  // Auto‑remove oldest trail every 2 seconds
  useEffect(() => {
    if (trails.length > 0) {
      const timer = setTimeout(() => {
        setTrails((prev) => prev.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trails]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <AnimatePresence>
        {trails.map((trail, index) => (
          <motion.div
            key={trail.id}
            initial={{
              opacity: 0,
              scale: 0,
              x: trail.x - 80,
              y: trail.y - 60,
              rotate: trail.rotation,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: trail.x - 80,
              y: trail.y - 60,
              rotate: trail.rotation,
            }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute w-40 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white pointer-events-auto"
            style={{ zIndex: index }}
          >
            <img
              src={trail.image.src}
              alt={trail.image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
              <span className="text-white text-[10px] font-bold">
                {trail.image.alt}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorTrailImages;
