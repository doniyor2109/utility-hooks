import { renderHook } from "react-hooks-testing-library";
import { cleanup } from "react-testing-library";

import { useCallbackProxy } from "../useCallbackProxy";

afterEach(cleanup);

it("creates proxy function", () => {
  const { result, rerender } = renderHook(
    ({ value }) => useCallbackProxy(() => value),
    { initialProps: { value: 0 } },
  );

  const { current: proxy } = result;

  expect(proxy()).toBe(0);
  expect(result.current).toBe(proxy);

  rerender({ value: 10 });

  expect(proxy()).toBe(10);
  expect(result.current).toBe(proxy);

  rerender({ value: 20 });

  expect(proxy()).toBe(20);
  expect(result.current).toBe(proxy);
});
