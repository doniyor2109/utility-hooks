import * as api from '../index';

it('exposes public api', () => {
  expect(api).toMatchInlineSnapshot(`
    Object {
      "areDepsEqualWith": [Function],
      "reducePromiseState": [Function],
      "useConstant": [Function],
      "useEventCallback": [Function],
      "useIsomorphicLayoutEffect": [Function],
      "useMemoWith": [Function],
      "usePrevious": [Function],
      "usePromise": [Function],
      "usePureDeps": [Function],
      "usePureMemo": [Function],
      "useValueRef": [Function],
      "useWhenValueChanges": [Function],
    }
  `);
});
