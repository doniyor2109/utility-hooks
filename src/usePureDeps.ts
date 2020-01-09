import { DependencyList, useRef } from 'react';

import { warning } from './internal/warning';
import { usePrevious } from './usePrevious';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DepsComparator = (a: any, b: any) => boolean;

export function areDepsEqualWith(
  hookName: string,
  next: DependencyList,
  prev: DependencyList,
  isEqual: DepsComparator,
): boolean {
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'production') {
    warning(
      next.length !== prev.length,
      `The final argument passed to ${hookName} changed size between renders. ` +
        'The order and size of this array must remain constant.\n\n' +
        `Previous: [${prev}]\n` +
        `Incoming: [${next}]`,
    );
  }

  for (let i = 0; i < prev.length && i < next.length; i++) {
    if (!isEqual(next[i], prev[i])) {
      return false;
    }
  }

  return true;
}

export function usePureDeps(
  deps: DependencyList,
  isEqual: DepsComparator = Object.is,
): DependencyList {
  const ref = useRef(deps);
  const prev = usePrevious(deps);

  if (prev && !areDepsEqualWith('usePureDeps', deps, prev, isEqual)) {
    ref.current = deps;
  }

  return ref.current;
}
