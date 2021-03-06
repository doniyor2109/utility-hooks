import { renderHook } from '@testing-library/react-hooks';

import { useEventCallback } from '../useEventCallback';

it('creates proxy function', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useEventCallback(() => value),
    { initialProps: { value: 0 } },
  );

  const { current: proxy } = result;

  expect(proxy()).toBe(0);
  expect(result.current).toBe(proxy);

  rerender({ value: 10 });

  expect(proxy()).toBe(10);
  expect(result.current).toBe(proxy);

  rerender({ value: 20 });

  expect(proxy()).toBe(20);
  expect(result.current).toBe(proxy);
});
