import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): undefined | T {
  const ref = useRef<undefined | T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
