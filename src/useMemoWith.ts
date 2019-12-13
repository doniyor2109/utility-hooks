import { DependencyList, useRef } from 'react';

import { areDepsEqualWith, DepsComparator } from './areDepsEqualWith';
import { usePrevious } from './usePrevious';

export function useMemoWith<T>(
  factory: () => T,
  deps: DependencyList,
  isEqual: DepsComparator,
): T {
  const value = useRef<T>();
  const prevDeps = usePrevious(deps);

  if (
    !prevDeps ||
    !value.current ||
    !areDepsEqualWith('useMemoWith', deps, prevDeps, isEqual)
  ) {
    value.current = factory();
  }

  return value.current;
}
