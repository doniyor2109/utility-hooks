import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { usePromise } from '../usePromise';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

afterEach(cleanup);

it('fulfills value', async () => {
  const { result, waitForNextUpdate } = renderHook(
    ({ id }) => usePromise(() => Promise.resolve({ id }), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": Object {
        "id": 1,
      },
    }
  `);
});

it('accepts non promise value', async () => {
  const { result, waitForNextUpdate } = renderHook(
    ({ id }) => usePromise(() => ({ id }), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": Object {
        "id": 1,
      },
    }
  `);
});

it('accepts thenable value', async () => {
  const { result, waitForNextUpdate } = renderHook(
    ({ id }) =>
      usePromise(() => ({ then: resolve => resolve?.({ id }) }), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": Object {
        "id": 1,
      },
    }
  `);
});

it('rejects value', async () => {
  const { result, waitForNextUpdate } = renderHook(
    ({ id }) => usePromise(() => Promise.reject(new Error(`ID: ${id}`)), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "error": [Error: ID: 1],
      "status": "rejected",
    }
  `);
});

it('resets state on deps change', async () => {
  const { unmount, result, rerender, waitForNextUpdate } = renderHook(
    ({ id }) => usePromise(() => Promise.resolve({ id }), [id]),
    { initialProps: { id: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": Object {
        "id": 1,
      },
    }
  `);

  rerender({ id: 2 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  unmount();
});

it('ignores previously called promises', async () => {
  const { result, rerender, waitForNextUpdate } = renderHook(
    ({ delay }) => usePromise(() => wait(delay).then(() => delay), [delay]),
    { initialProps: { delay: 300 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  rerender({ delay: 200 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  rerender({ delay: 100 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "pending",
    }
  `);

  await waitForNextUpdate();

  const finalValue = result.current;

  expect(finalValue).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": 100,
    }
  `);

  expect(result.current).toBe(finalValue);
  expect(result.current).toBe(finalValue);
});

it('provides abort signal', () => {
  const signals: AbortSignal[] = [];

  const { rerender, unmount } = renderHook(
    ({ id }) =>
      usePromise(
        ({ abortSignal }) => {
          signals.push(abortSignal);

          return Promise.resolve({ id });
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

describe('options.key', () => {
  it('runs fetch on `options.key` change', async () => {
    const fetch = jest.fn(Math.random);
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ key }) => usePromise(fetch, [], { key }),
      { initialProps: { key: 1 } },
    );

    expect(fetch).toHaveBeenCalledTimes(1);

    await waitForNextUpdate();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveLastReturnedWith(result.current.value);

    rerender({ key: 1 });

    expect(fetch).toHaveBeenCalledTimes(1);

    rerender({ key: 2 });

    expect(fetch).toHaveBeenCalledTimes(2);

    await waitForNextUpdate();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveLastReturnedWith(result.current.value);

    rerender({ key: 1 });

    expect(fetch).toHaveBeenCalledTimes(3);

    await waitForNextUpdate();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveLastReturnedWith(result.current.value);
  });
});

describe('options.skip', () => {
  it("does't run request when hook is skipped", async () => {
    const fetch = jest.fn(() => Promise.resolve({ id: 1 }));

    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ skip }) => usePromise(fetch, [], { skip }),
      { initialProps: { skip: true } },
    );

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

    await waitForNextUpdate();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchInlineSnapshot(`
    Object {
      "status": "fulfilled",
      "value": Object {
        "id": 1,
      },
    }
  `);
  });

  it('aborts pending request on skip', () => {
    const abortSignals: AbortSignal[] = [];

    const { rerender, unmount } = renderHook(
      ({ skip }) =>
        usePromise(
          ({ abortSignal }) => {
            abortSignals.push(abortSignal);

            return Promise.resolve({ id: 1 });
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

    unmount();
  });
});
