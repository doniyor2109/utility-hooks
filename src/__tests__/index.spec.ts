import * as api from '../index';

it('exposes public api', () => {
  expect(api).toMatchInlineSnapshot(`
    Object {
      "areDepsEqualWith": [Function],
      "useConstant": [Function],
      "useEventCallback": [Function],
      "useIsomorphicLayoutEffect": [Function],
      "useMemoWith": [Function],
      "usePrevious": [Function],
      "usePromise": [Function],
      "usePureMemo": [Function],
      "useValueRef": [Function],
      "useWhenValueChanges": [Function],
    }
  `);
});
