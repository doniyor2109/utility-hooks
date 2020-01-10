import { renderHook } from '@testing-library/react-hooks';

import { useConstant } from '../useConstant';

it('runs factory once to create value', () => {
  const factory = jest.fn(() => Math.random());
  const { result, rerender } = renderHook(() => useConstant(factory));

  expect(factory).toHaveBeenCalledTimes(1);
  expect(factory).toHaveLastReturnedWith(result.current);

  rerender();

  expect(factory).toHaveBeenCalledTimes(1);
  expect(factory).toHaveLastReturnedWith(result.current);
});

it('runs factory once for nil values', () => {
  [0, NaN, null, false, undefined].forEach(x => {
    const factory = jest.fn(() => x);
    const { result, rerender } = renderHook(() => useConstant(factory));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(x);

    rerender();

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(x);
  });
});
