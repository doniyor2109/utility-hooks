import { DependencyList, Key, useEffect, useState } from 'react';

import { areDepsEqualWith } from './areDepsEqualWith';
import { useEventCallback } from './useEventCallback';
import { useMemoWith } from './useMemoWith';

function areEqualDeps(a: DependencyList, b: DependencyList) {
  return areDepsEqualWith('usePromise', a, b, Object.is);
}

export type PromiseState<T> =
  | { status: 'pending'; value?: undefined; error?: undefined }
  | { status: 'fulfilled'; value: T; error?: undefined }
  | { status: 'rejected'; value?: undefined; error: Error };

export interface UsePromiseOptions {
  key?: Key;
  skip?: boolean;
}

export interface UsePromiseFactoryOptions {
  abortSignal: AbortSignal;
}

export type UsePromiseFactory<T> = (
  options: UsePromiseFactoryOptions,
) => T | PromiseLike<T>;

export function usePromise<T>(
  factory: UsePromiseFactory<T>,
  deps: DependencyList,
  { key, skip = false }: UsePromiseOptions = {},
): PromiseState<T> {
  const [state, setState] = useState<PromiseState<T>>({ status: 'pending' });
  const createPromise = useEventCallback(factory);
  const nextDeps = useMemoWith(() => deps, [deps], areEqualDeps);

  useEffect(() => {
    setState(prev =>
      prev.status === 'pending' ? prev : { status: 'pending' },
    );

    if (skip) {
      return;
    }

    const abortController = new AbortController();

    Promise.resolve(
      createPromise({ abortSignal: abortController.signal }),
    ).then(
      value => {
        if (!abortController.signal.aborted) {
          setState({ status: 'fulfilled', value });
        }
      },
      error => {
        if (!abortController.signal.aborted) {
          setState({ status: 'rejected', error });
        }
      },
    );

    return () => abortController.abort();
  }, [key, skip, nextDeps, createPromise]);

  return state;
}
