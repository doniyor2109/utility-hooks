import { renderHook } from '@testing-library/react-hooks';

import { useIsMounted } from '../useIsMounted';

it('returns mounted state', () => {
  const {
    result: { current: mountedRef },
    unmount,
  } = renderHook(() => useIsMounted());

  expect(mountedRef.current).toBeTruthy();
  unmount();
  expect(mountedRef.current).toBeFalsy();
});