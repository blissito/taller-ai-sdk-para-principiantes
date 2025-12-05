import { useRef, useEffect, type RefObject, type DependencyList } from "react";

export function useAutoScroll<T extends HTMLElement>(
  deps: DependencyList,
  threshold = 100
): [RefObject<T | null>, RefObject<HTMLDivElement | null>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    if (isNearBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, deps);

  return [containerRef, endRef];
}
