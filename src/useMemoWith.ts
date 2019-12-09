import { DependencyList, useRef } from 'react';

import { areDepsEqualWith, DepsComparator } from './areDepsEqualWith';
import { usePrevious } from './usePrevious';

export function useMemoWith<T>(
  factory: () => T,
  deps: DependencyList,
  isEqual: DepsComparator,
): T {
  const prevDepsRef = usePrevious(deps);
  const valueRef = useRef<T | null>(null);

  if (
    !prevDepsRef ||
    !valueRef.current ||
    !areDepsEqualWith('useMemoWith', deps, prevDepsRef, isEqual)
  ) {
    valueRef.current = factory();
  }

  return valueRef.current;
}
