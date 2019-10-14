import { useEffect, useRef } from "react";

export function useWhenValueChanges<T>(
  value: T,
  effect: (prevValue: T) => void,
  isEqual: (prev: T, next: T) => boolean = Object.is,
): void {
  const ref = useRef(value);

  useEffect(() => {
    if (!isEqual(value, ref.current)) {
      effect(ref.current);
      ref.current = value;
    }
  });
}
