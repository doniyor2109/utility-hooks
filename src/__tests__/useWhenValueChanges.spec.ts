import { cleanup } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

import { useWhenValueChanges } from "../useWhenValueChanges";

afterEach(cleanup);

it("calls effect only when value changes", () => {
  const effect = jest.fn();

  const { rerender } = renderHook(
    ({ value }) => useWhenValueChanges(value, effect),
    {
      initialProps: { value: "foo" },
    },
  );

  expect(effect).toHaveBeenCalledTimes(0);

  rerender({ value: "bar" });

  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenLastCalledWith("foo");

  rerender({ value: "bar" });

  expect(effect).toHaveBeenCalledTimes(1);

  rerender({ value: "baz" });

  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenLastCalledWith("bar");
});

it("compares with custom isEqual function", () => {
  const effect = jest.fn();

  const value1 = new Date(0);
  const value2 = new Date(0);
  const value3 = new Date(10);

  const { rerender } = renderHook(
    ({ value }) =>
      useWhenValueChanges(value, effect, (a, b) => a.getTime() === b.getTime()),
    {
      initialProps: { value: value1 },
    },
  );

  expect(effect).toHaveBeenCalledTimes(0);

  rerender({ value: value2 });

  expect(effect).toHaveBeenCalledTimes(0);

  rerender({ value: value3 });

  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenLastCalledWith(value2);
});
