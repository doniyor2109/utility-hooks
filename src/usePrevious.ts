import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export function usePrevious<T>(value: T): undefined | T {
  const ref = useRef<undefined | T>();

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
