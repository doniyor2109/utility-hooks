import { cleanup } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

import { useConstant } from "../useConstant";

afterEach(cleanup);

it("runs memoize only once", () => {
  const factory = jest.fn(() => Math.random());
  const { result, rerender } = renderHook(() => useConstant(factory));

  expect(factory).toBeCalledTimes(1);
  expect(factory).lastReturnedWith(result.current);

  rerender();

  expect(factory).toBeCalledTimes(1);
  expect(factory).lastReturnedWith(result.current);
});
