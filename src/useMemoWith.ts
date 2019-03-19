import { DependencyList, useRef } from "react";

import { Comparator, areDepsEqualWith } from "./areDepsEqualWith";

export function useMemoWith<T>(
  factory: () => T,
  isEqual: Comparator,
  deps: DependencyList,
): T {
  const prevDepsRef = useRef(deps);
  const valueRef = useRef<T | null>(null);

  if (
    !valueRef.current ||
    !areDepsEqualWith("useMemoWith", deps, prevDepsRef.current, isEqual)
  ) {
    prevDepsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current;
}
