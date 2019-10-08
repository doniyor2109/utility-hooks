import { useRef } from "react";

interface ValueNode<T> {
  value: T;
}

export function useConstant<T>(factory: () => T): T {
  const ref = useRef<ValueNode<T>>();

  if (!ref.current) {
    ref.current = { value: factory() };
  }

  return ref.current.value;
}
