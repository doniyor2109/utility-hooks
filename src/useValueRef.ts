import { MutableRefObject, useEffect, useRef } from "react";

export function useValueRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
}
