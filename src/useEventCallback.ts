import { useCallback } from "react";

import { useValueRef } from "./useValueRef";

export function useEventCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = useValueRef(callback);

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}
