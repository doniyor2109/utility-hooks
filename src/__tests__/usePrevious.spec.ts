import { cleanup } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

import { usePrevious } from "../usePrevious";

afterEach(cleanup);

it("runs memoize only once", () => {
  const { result, rerender } = renderHook(
    ({ next }) => {
      const prev = usePrevious(next);

      return { next, prev };
    },
    { initialProps: { next: 1 } },
  );

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "next": 1,
      "prev": undefined,
    }
  `);

  rerender({ next: 2 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "next": 2,
      "prev": 1,
    }
  `);

  rerender({ next: 3 });

  expect(result.current).toMatchInlineSnapshot(`
    Object {
      "next": 3,
      "prev": 2,
    }
  `);
});
