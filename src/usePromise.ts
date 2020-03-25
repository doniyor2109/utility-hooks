import { DependencyList, Key, Reducer, useEffect, useReducer } from 'react';

import { useEventCallback } from './useEventCallback';
import { useMemoWith } from './useMemoWith';
import { usePureDeps } from './usePureDeps';

export type PromiseState<T> =
  | { status: 'pending'; value?: T; error?: undefined }
  | { status: 'fulfilled'; value: T; error?: undefined }
  | { status: 'rejected'; value?: T; error: Error };

export type PromiseReducerAction<T> =
  | { type: 'init' }
  | { type: 'pending' }
  | { type: 'fulfill'; payload: T }
  | { type: 'reject'; payload: Error };

export type PromiseReducer<T> = Reducer<
  PromiseState<T>,
  PromiseReducerAction<T>
>;

export interface UsePromiseOptions<T> {
  key?: Key;
  skip?: boolean;
  reducer?: PromiseReducer<T>;
}

export interface UsePromiseFactoryOptions {
  abortSignal: AbortSignal;
}

export type UsePromiseFactory<T> = (
  options: UsePromiseFactoryOptions,
) => T | PromiseLike<T>;

export function reducePromiseState<T>(
  state: PromiseState<T>,
  action: PromiseReducerAction<T>,
): PromiseState<T> {
  switch (action.type) {
    case 'pending':
      return state.status === 'pending' ? state : { status: 'pending' };
    case 'fulfill':
      return { status: 'fulfilled', value: action.payload };
    case 'reject':
      return { status: 'rejected', error: action.payload };
  }

  return state;
}

function isEqualPromiseState<T>(a: PromiseState<T>, b: PromiseState<T>) {
  return (
    a.status === b.status &&
    Object.is(a.error, b.error) &&
    Object.is(a.value, b.value)
  );
}

export function usePromise<T>(
  factory: UsePromiseFactory<T>,
  deps: DependencyList,
  {
    key,
    skip = false,
    reducer = reducePromiseState,
  }: UsePromiseOptions<T> = {},
): PromiseState<T> {
  const pureDeps = usePureDeps(deps);
  const pureFactory = useEventCallback(factory);
  const [state, dispatch] = useReducer(reducer, { status: 'pending' }, (prev) =>
    reducer(prev, { type: 'init' }),
  );

  useEffect(() => {
    dispatch({ type: 'pending' });

    if (skip) {
      return;
    }

    const abortController = new AbortController();

    Promise.resolve(pureFactory({ abortSignal: abortController.signal })).then(
      (payload) => {
        if (!abortController.signal.aborted) {
          dispatch({ type: 'fulfill', payload });
        }
      },
      (payload) => {
        if (!abortController.signal.aborted) {
          dispatch({ type: 'reject', payload });
        }
      },
    );

    return () => abortController.abort();
  }, [key, skip, pureDeps, pureFactory]);

  return useMemoWith(() => state, [state], isEqualPromiseState);
}
