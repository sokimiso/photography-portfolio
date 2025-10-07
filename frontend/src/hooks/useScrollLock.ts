import { useEffect } from "react";

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    const body = document.body;

    if (locked) {
      // Calculate scrollbar width
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      body.style.overflow = "hidden";
      body.style.paddingRight = `${scrollBarWidth}px`; // prevent layout shift
    } else {
      body.style.overflow = "";
      body.style.paddingRight = "";
    }

    return () => {
      body.style.overflow = "";
      body.style.paddingRight = "";
    };
  }, [locked]);
}
