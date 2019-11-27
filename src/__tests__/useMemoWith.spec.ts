import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useMemoWith } from '../useMemoWith';

afterEach(cleanup);

function isEqualDate(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

it('compares dependencies with custom comparator', () => {
  const value1 = new Date(0);
  const value2 = new Date(0);
  const value3 = new Date(10);

  const { result, rerender } = renderHook(
    ({ value }) => useMemoWith(() => value, [value], isEqualDate),
    { initialProps: { value: value1 } },
  );

  expect(result.current).toBe(value1);

  rerender({ value: value2 });

  expect(result.current).toBe(value1);
  expect(result.current).not.toBe(value2);

  rerender({ value: value3 });

  expect(result.current).toBe(value3);
});
