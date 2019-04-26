import { useCallback } from "react";

import { useValueRef } from "./useValueRef";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackProxy<T extends (...args: Array<any>) => any>(
  callback: T,
): T {
  const callbackRef = useValueRef(callback);

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}
