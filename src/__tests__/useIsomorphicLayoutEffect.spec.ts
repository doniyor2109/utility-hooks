/**
 * @jest-environment jsdom
 */

import { useLayoutEffect } from 'react';

import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

it('should be `useLayoutEffect` in `jsdom` environment', () => {
  expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
});
