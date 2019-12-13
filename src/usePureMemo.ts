import { DependencyList } from 'react';

import { DepsComparator } from './areDepsEqualWith';
import { useMemoWith } from './useMemoWith';

export function usePureMemo<T>(
  factory: () => T,
  deps: DependencyList,
  isEqual: DepsComparator,
): T {
  const value = useMemoWith(factory, deps, isEqual);

  return useMemoWith(() => value, [value], isEqual);
}
