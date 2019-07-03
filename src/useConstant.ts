import { useRef } from "react";

export function useConstant<T>(factory: () => T): T {
  const ref = useRef<T>();

  if (ref.current === undefined) {
    ref.current = factory();
  }

  return ref.current;
}

/** @deprecated Renamed to `useConstant`.  */
export const useMemoOnce = useConstant;