import { cleanup } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";

import { usePromise } from "../usePromise";

class TestPromise implements Promise<string> {
  readonly [Symbol.toStringTag]: string;

  private fulfillHandlers: Set<(value: string) => void>;
  private rejectHandlers: Set<(error: Error) => void>;
  private finallyHandlers: Set<() => void>;

  constructor() {
    this.rejectHandlers = new Set();
    this.fulfillHandlers = new Set();
    this.finallyHandlers = new Set();
  }

  then<TResult1 = string, TResult2 = never>(
    onFulfilled?:
      | null
      | undefined
      | ((value: string) => PromiseLike<TResult1> | TResult1),
    onRejected?:
      | null
      | undefined
      | ((reason: Error) => PromiseLike<TResult2> | TResult2),
  ): Promise<TResult1 | TResult2> {
    if (onFulfilled) {
      this.fulfillHandlers.add(onFulfilled);
    }

    if (onRejected) {
      this.rejectHandlers.add(onRejected);
    }

    return this as any;
  }

  catch<TResult = never>(
    onRejected?:
      | null
      | undefined
      | ((reason: Error) => PromiseLike<TResult> | TResult),
  ): Promise<string | TResult> {
    if (onRejected) {
      this.rejectHandlers.add(onRejected);
    }

    return this;
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<string> {
    if (onfinally) {
      this.finallyHandlers.add(onfinally);
    }

    return this;
  }

  private finalize() {
    this.finallyHandlers.forEach(fn => fn());

    this.rejectHandlers.clear();
    this.finallyHandlers.clear();
    this.fulfillHandlers.clear();
  }

  resolve(result: string) {
    this.fulfillHandlers.forEach(fn => fn(result));
    this.finalize();
  }

  reject(error: Error) {
    this.rejectHandlers.forEach(fn => fn(error));
    this.finalize();
  }
}

class TestAPI {
  private cache: Map<number, TestPromise>;

  constructor() {
    this.cache = new Map();
  }

  private ensurePromise(id: number) {
    let cached = this.cache.get(id);

    if (!cached) {
      cached = new TestPromise();
      this.cache.set(id, cached);
    }

    return cached;
  }

  fetch(id: number): TestPromise {
    return this.ensurePromise(id);
  }

  resolve(id: number, value: string) {
    return this.ensurePromise(id).resolve(value);
  }

  reject(id: number, error: Error) {
    return this.ensurePromise(id).reject(error);
  }
}

afterEach(cleanup);

it("fulfills value", () => {
  const api = new TestAPI();

  const { result } = renderHook(
    ({ id }) => usePromise(() => api.fetch(id), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.resolve(1, "foo"));

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": "foo",
    }
  `);
});

it("rejects value", () => {
  const api = new TestAPI();

  const { result } = renderHook(
    ({ id }) => usePromise(() => api.fetch(id), [id]),
    {
      initialProps: { id: 1 },
    },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.reject(1, new Error("nope")));

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "error": [Error: nope],
      "status": "rejected",
    }
  `);
});

it("resets state on deps change", () => {
  const api = new TestAPI();

  const { result, rerender } = renderHook(
    ({ id }) => usePromise(() => api.fetch(id), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.resolve(1, "foo"));

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": "foo",
    }
  `);

  rerender({ id: 2 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);
});

it("ignores previously called promises", () => {
  const api = new TestAPI();

  const { result, rerender } = renderHook(
    ({ id }) => usePromise(() => api.fetch(id), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  rerender({ id: 2 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  rerender({ id: 3 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.resolve(3, "baz"));

  const finalValue = result.current;

  expect(finalValue).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": "baz",
    }
  `);

  act(() => api.resolve(2, "bar"));

  expect(result.current).toBe(finalValue);

  act(() => api.resolve(1, "foo"));

  expect(result.current).toBe(finalValue);
});

it("provides abort signal", () => {
  const api = new TestAPI();
  const signals: AbortSignal[] = [];

  const { rerender, unmount } = renderHook(
    ({ id }) =>
      usePromise(
        ({ abortSignal }) => {
          signals.push(abortSignal);

          return api.fetch(id);
        },
        [id],
      ),
    { initialProps: { id: 1 } },
  );

  expect(signals).toHaveLength(1);
  expect(signals[0].aborted).toBe(false);

  rerender({ id: 2 });

  expect(signals).toHaveLength(2);
  expect(signals[0].aborted).toBe(true);
  expect(signals[1].aborted).toBe(false);

  unmount();

  expect(signals).toHaveLength(2);
  expect(signals[0].aborted).toBe(true);
  expect(signals[1].aborted).toBe(true);
});

it("does't run request when hook is skipped", () => {
  const api = new TestAPI();
  const fetch = jest.fn(() => api.fetch(1));

  const { result, rerender } = renderHook(
    ({ skip }) => usePromise(fetch, [], { skip }),
    { initialProps: { skip: true } },
  );

  expect(fetch).not.toHaveBeenCalled();
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.resolve(1, "foo"));

  expect(fetch).not.toHaveBeenCalled();
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  rerender({ skip: false });

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  act(() => api.resolve(1, "foo"));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": "foo",
    }
  `);
});

it("aborts pending request on skip", () => {
  const api = new TestAPI();
  const abortSignals: AbortSignal[] = [];

  const { rerender } = renderHook(
    ({ skip }) =>
      usePromise(
        ({ abortSignal }) => {
          abortSignals.push(abortSignal);

          return api.fetch(1);
        },
        [],
        { skip },
      ),
    { initialProps: { skip: false } },
  );

  expect(abortSignals).toHaveLength(1);
  expect(abortSignals[0].aborted).toBe(false);

  rerender({ skip: true });

  expect(abortSignals).toHaveLength(1);
  expect(abortSignals[0].aborted).toBe(true);

  rerender({ skip: false });

  expect(abortSignals).toHaveLength(2);
  expect(abortSignals[0].aborted).toBe(true);
  expect(abortSignals[1].aborted).toBe(false);
});
