import { DependencyList } from 'react';

import { warning } from './internal/warning';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DepsComparator = (a: any, b: any) => boolean;

export function areDepsEqualWith(
  hookName: string,
  nextDeps: DependencyList,
  prevDeps: DependencyList,
  isEqual: DepsComparator,
): boolean {
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'production') {
    warning(
      nextDeps.length !== prevDeps.length,
      `The final argument passed to ${hookName} changed size between renders. ` +
        'The order and size of this array must remain constant.\n\n' +
        `Previous: [${prevDeps}]\n` +
        `Incoming: [${nextDeps}]`,
    );
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (!isEqual(nextDeps[i], prevDeps[i])) {
      return false;
    }
  }

  return true;
}
