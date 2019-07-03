import * as api from "../index";

it("exposes public api", () => {
  expect(api).toMatchInlineSnapshot(`
    Object {
      "areDepsEqualWith": [Function],
      "useCallbackProxy": [Function],
      "useConstant": [Function],
      "useMemoOnce": [Function],
      "useMemoWith": [Function],
      "usePrevious": [Function],
      "useValueRef": [Function],
    }
  `);
});
