import { useCallback, useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackProxy<T extends (...args: Array<any>) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  const callbackProxy = useCallback(
    (...args) => callbackRef.current(...args),
    []
  );

  useEffect(() => {
    callbackRef.current = callback;
  });

  return callbackProxy as T;
}
