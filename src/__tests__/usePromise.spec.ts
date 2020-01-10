import { renderHook } from '@testing-library/react-hooks';

import { reducePromiseState, usePromise } from '../usePromise';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

describe('options.reducer', () => {
  it('allows to reduce `init` action', async () => {
    const { result, waitForNextUpdate } = renderHook(
      ({ page }) =>
        usePromise(() => [page], [page], {
          reducer: (state, action) => {
            if (action.type === 'init') {
              return { status: 'pending', value: [] };
            }

            return reducePromiseState(state, action);
          },
        }),
      { initialProps: { page: 1 } },
    );

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
        ],
      }
    `);
  });

  it('allows to reduce `perform` action', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ page }) =>
        usePromise(() => [page], [page], {
          reducer: (state, action) => {
            if (action.type === 'init') {
              return { status: 'pending', value: [] };
            }

            if (action.type === 'pending') {
              return { status: 'pending', value: state.value };
            }

            return reducePromiseState(state, action);
          },
        }),
      { initialProps: { page: 1 } },
    );

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
        ],
      }
    `);

    rerender({ page: 2 });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [
          1,
        ],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          2,
        ],
      }
    `);
  });

  it('allows to reduce `fulfill` action', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ page }) =>
        usePromise(() => [page], [page], {
          reducer: (state, action) => {
            if (action.type === 'init') {
              return { status: 'pending', value: [] };
            }

            if (action.type === 'pending') {
              return { status: 'pending', value: state.value };
            }

            if (action.type === 'fulfill') {
              return {
                status: 'fulfilled',
                value: !state.value
                  ? action.payload
                  : [...state.value, ...action.payload],
              };
            }

            return reducePromiseState(state, action);
          },
        }),
      { initialProps: { page: 1 } },
    );

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
        ],
      }
    `);

    rerender({ page: 2 });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [
          1,
        ],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
          2,
        ],
      }
    `);
  });

  it('allows to reduce `reject` action', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ page }) =>
        usePromise(
          () => (page < 3 ? [page] : Promise.reject(new Error('404'))),
          [page],
          {
            reducer: (state, action) => {
              if (action.type === 'init') {
                return { status: 'pending', value: [] };
              }

              if (action.type === 'pending') {
                return { status: 'pending', value: state.value };
              }

              if (action.type === 'fulfill') {
                return {
                  status: 'fulfilled',
                  value: !state.value
                    ? action.payload
                    : [...state.value, ...action.payload],
                };
              }

              if (action.type === 'reject') {
                return {
                  status: 'rejected',
                  error: action.payload,
                  value: state.value,
                };
              }

              return state;
            },
          },
        ),
      { initialProps: { page: 1 } },
    );

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
        ],
      }
    `);

    rerender({ page: 2 });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [
          1,
        ],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "fulfilled",
        "value": Array [
          1,
          2,
        ],
      }
    `);

    rerender({ page: 3 });

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "status": "pending",
        "value": Array [
          1,
          2,
        ],
      }
    `);

    await waitForNextUpdate();

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "error": [Error: 404],
        "status": "rejected",
        "value": Array [
          1,
          2,
        ],
      }
    `);
  });
});
