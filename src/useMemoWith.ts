import { DependencyList, useMemo } from 'react';

import { DepsComparator, usePureDeps } from './usePureDeps';

export function useMemoWith<T>(
  factory: () => T,
  deps: DependencyList,
  isEqual: DepsComparator,
): T {
  const pureDeps = usePureDeps(deps, isEqual);

  return useMemo(factory, pureDeps);
}
