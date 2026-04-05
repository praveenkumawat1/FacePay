import React, { useEffect, useRef } from "react";
import axios from "axios";

const useEngagementTracker = (sectionId) => {
  const startTime = useRef(Date.now());
  const scrollRef = useRef(0);
  const clickCountRef = useRef(0);

  useEffect(() => {
    // Scroll tracking
    const handleScroll = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        const height = rect.height;
        const visibleHeight =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (visibleHeight > 0) {
          const scrollDepth = Math.min((rect.top / -height) * 100, 100);
          scrollRef.current = Math.max(scrollRef.current, scrollDepth);
        }
      }
    };

    // Click tracking
    const handleClick = () => {
      clickCountRef.current += 1;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("click", handleClick);

    // Initial load
    startTime.current = Date.now();

    return () => {
      // Cleanup: When user leaves the page or section unmounts, send data
      const dwellTime = Date.now() - startTime.current;
      const data = {
        sectionId: sectionId,
        dwellTime: dwellTime,
        scrollDepth: Math.floor(scrollRef.current),
        clickCount: clickCountRef.current,
        sessionId: localStorage.getItem("session_id") || "testing_id",
      };

      // Use Navigator.sendBeacon for reliable delivery on unmount
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/engagement/log", blob);

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [sectionId]);

  return null;
};

export default useEngagementTracker;
