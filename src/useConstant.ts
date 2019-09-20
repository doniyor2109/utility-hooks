import { useRef } from "react";

import { deprecated } from "./internal/warning";

export function useConstant<T>(factory: () => T): T {
  const ref = useRef<T>();

  if (ref.current === undefined) {
    ref.current = factory();
  }

  return ref.current;
}

/* istanbul ignore next */
/** @deprecated Renamed to `useConstant`.  */
export function useMemoOnce<T>(factory: () => T): T {
  deprecated("`useMemoOnce` is renamed to `useConstant`.");

  return useConstant(factory);
}
