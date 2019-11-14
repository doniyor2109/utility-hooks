import { DependencyList, useEffect, useState } from "react";

import { areDepsEqualWith } from "./areDepsEqualWith";
import { useEventCallback } from "./useEventCallback";
import { useMemoWith } from "./useMemoWith";

function areEqualDeps(a: DependencyList, b: DependencyList) {
  return areDepsEqualWith("usePromise", a, b, Object.is);
}

export type PromiseState<T> =
  | { status: "pending"; value?: undefined; error?: undefined }
  | { status: "fulfilled"; value: T; error?: undefined }
  | { status: "rejected"; value?: undefined; error: Error };

export function usePromise<T>(
  factory: (options: { abortSignal: AbortSignal }) => Promise<T>,
  deps: DependencyList,
): PromiseState<T> {
  const [state, setState] = useState<PromiseState<T>>({ status: "pending" });
  const createPromise = useEventCallback(factory);
  const nextDeps = useMemoWith(() => deps, [deps], areEqualDeps);

  useEffect(() => {
    const abortController = new AbortController();

    setState(prev =>
      prev.status === "pending" ? prev : { status: "pending" },
    );

    createPromise({ abortSignal: abortController.signal }).then(
      value => {
        if (!abortController.signal.aborted) {
          setState({ status: "fulfilled", value });
        }
      },
      error => {
        if (!abortController.signal.aborted) {
          setState({ status: "rejected", error });
        }
      },
    );

    return () => abortController.abort();
  }, [createPromise, nextDeps]);

  return state;
}
