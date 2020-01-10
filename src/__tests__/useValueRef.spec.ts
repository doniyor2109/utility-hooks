import { renderHook } from '@testing-library/react-hooks';

import { useValueRef } from '../useValueRef';

it('stores and updates value in ref', () => {
  const values = [{}, {}, {}];

  const { result, rerender } = renderHook(({ value }) => useValueRef(value), {
    initialProps: { value: values[0] },
  });

  expect(result.current.current).toBe(values[0]);

  values.forEach((value, idx) => {
    if (idx === 0) {
      return;
    }

    rerender({ value });
    expect(result.current.current).toBe(value);
  });
});
