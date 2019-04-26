import { renderHook } from "react-hooks-testing-library";
import { cleanup } from "react-testing-library";

import { useValueRef } from "../useValueRef";

afterEach(cleanup);

it("stores and updates value in ref", () => {
  const value1 = new Date(0);
  const value2 = new Date(0);
  const value3 = new Date(0);

  const { result, rerender } = renderHook(({ value }) => useValueRef(value), {
    initialProps: { value: value1 },
  });

  const ref = result.current;

  expect(result.current.current).toBe(value1);

  rerender({ value: value2 });
  expect(result.current).toBe(ref);
  expect(result.current.current).toBe(value2);

  rerender({ value: value3 });
  expect(result.current).toBe(ref);
  expect(result.current.current).toBe(value3);
});
