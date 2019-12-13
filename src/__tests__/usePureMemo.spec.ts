import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { usePureMemo } from '../usePureMemo';

afterEach(cleanup);

interface Value {
  a: number;
  b: number;
  c?: number;
}

function isEqualValue(a: Value, b: Value): boolean {
  return a.a === b.a && a.b === b.b && a.c === b.c;
}

it('compares dependencies with custom comparator', () => {
  const value1: Value = { a: 1, b: 2, c: 3 };
  const value2: Value = { a: 1, b: 2 };
  const value3: Value = { a: 2, b: 3 };

  const { result, rerender } = renderHook(
    ({ value }) =>
      usePureMemo(() => ({ a: value.a, b: value.b }), [value], isEqualValue),
    { initialProps: { value: value1 } },
  );

  const result1 = result.current;

  expect(value1).toMatchObject(result1);

  rerender({ value: value2 });

  expect(result.current).toBe(result1);

  rerender({ value: value2 });

  expect(result.current).toBe(result1);

  rerender({ value: value2 });

  expect(result.current).toBe(result1);

  rerender({ value: value3 });

  expect(value3).toMatchObject(result.current);
});
