import { DependencyList } from 'react';

import { useMemoWith } from './useMemoWith';
import { DepsComparator } from './usePureDeps';

export function usePureMemo<T>(
  factory: () => T,
  deps: DependencyList,
  isEqual: DepsComparator,
): T {
  const value = useMemoWith(factory, deps, isEqual);

  return useMemoWith(() => value, [value], isEqual);
}
