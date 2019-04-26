import { MutableRefObject, useRef } from "react";

export function useValueRef<T>(value: T): MutableRefObject<T> {
  const valueRef = useRef(value);

  // Update ref if it changed.
  if (valueRef.current !== value) {
    valueRef.current = value;
  }

  return valueRef;
}
