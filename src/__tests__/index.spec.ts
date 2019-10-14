import * as api from "../index";

it("exposes public api", () => {
  expect(api).toMatchInlineSnapshot(`
    Object {
      "areDepsEqualWith": [Function],
      "useConstant": [Function],
      "useEventCallback": [Function],
      "useMemoWith": [Function],
      "usePrevious": [Function],
      "useValueRef": [Function],
      "useWhenValueChanges": [Function],
    }
  `);
});
