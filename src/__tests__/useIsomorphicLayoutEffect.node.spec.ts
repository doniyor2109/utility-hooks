/**
 * @jest-environment node
 */

import { useEffect } from 'react';

import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

it('should be `useEffect` in `node` environment', () => {
  expect(useIsomorphicLayoutEffect).toBe(useEffect);
});
