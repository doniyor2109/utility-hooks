import { useCallback } from "react";

import { deprecated } from "./internal/warning";
import { useValueRef } from "./useValueRef";

export function useEventCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = useValueRef(callback);

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}

export function useCallbackProxy<T extends (...args: any[]) => any>(
  callback: T,
): T {
  deprecated("`useCallbackProxy` is renamed to `useEventCallback`.");

  return useEventCallback(callback);
}
