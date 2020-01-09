# utility-hooks

> Collection of low-level React hooks.

[![CircleCI](https://circleci.com/gh/umidbekkarimov/utility-hooks.svg?style=svg)](https://circleci.com/gh/umidbekkarimov/utility-hooks)
[![codecov](https://codecov.io/gh/umidbekkarimov/utility-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/umidbekkarimov/utility-hooks)
[![npm version](https://img.shields.io/npm/v/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/utility-hooks.svg)](https://bundlephobia.com/result?p=utility-hooks)
[![npm type definitions](https://img.shields.io/npm/types/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![npm downloads](https://img.shields.io/npm/dm/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![npm license](https://img.shields.io/npm/l/utility-hooks.svg)](https://npmjs.com/utility-hooks)

### Installation

```bash
npm install utility-hooks
```

### Environment compatibility

`utility-hooks` output uses modern browser features, all extra transpilations and polyfills should be done in application side.

### Static checking with `react-hooks/exhaustive-deps`

```diff
 {
-  "react-hooks/exhaustive-deps": ["warn"]
+  "react-hooks/exhaustive-deps": [
+    "warn",
+    {
+      "additionalHooks": "^(useMemoWith|usePromise|usePureDeps|usePureMemo|useIsomorphicLayoutEffect)$"
+    }
+  ]
 }
```

### Hooks

#### `useEventCallback(callback)`

> Inspired by [How to read an often-changing value from useCallback?](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

Unlike `useCallback`, `useEventCallback` does not accept second argument and stores original `callback` in ref.

```diff
 function Form() {
   const [text, updateText] = useState("");
-  const textRef = useRef();
-
-  useEffect(() => {
-    textRef.current = text; // Write it to the ref
-  });
-
-  const handleSubmit = useCallback(() => {
-    const currentText = textRef.current; // Read it from the ref
-    alert(currentText);
-  }, [textRef]); // Don't recreate handleSubmit like [text] would do
+  const handleSubmit = useEventCallback(() => {
+    alert(text);
+  });

   return (
     <>
       <input value={text} onChange={e => updateText(e.target.value)} />
       <ExpensiveTree onSubmit={handleSubmit} />
     </>
   );
 }

```

#### `useIsomorphicLayoutEffect(effect, deps)`

> Inspired by [react-redux/src/utils/useIsomorphicLayoutEffect](https://github.com/reduxjs/react-redux/blob/0f1ab0960c38ac61b4fe69285a5b401f9f6e6177/src/utils/useIsomorphicLayoutEffect.js)

Runs `useLayoutEffect` in browser environment (checks `document.createElement`), otherwise `useEffect`.

#### useConstant(factory)`

> Inspired by [How to create expensive objects lazily?](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily)

Runs factory only once and writes value in component `ref`.

```diff
 function Image(props) {
-  const ref = useRef(null);
   const node = useRef();
-
-  // ✅ IntersectionObserver is created lazily once
-  function getObserver() {
-    let observer = ref.current;
-    if (observer !== null) {
-      return observer;
-    }
-    let newObserver = new IntersectionObserver(onIntersect);
-    ref.current = newObserver;
-    return newObserver;
-  }
+  const observer = useConstant(() => new IntersectionObserver(onIntersect));

   useEffect(() => {
-    getObserver().observe(node.current);
+    observer.observe(node.current);
   }, [observer]);
 }
```

#### `useMemoWith(factory, deps, isEqual)`

> Inspired by [Gist](https://gist.github.com/kentcdodds/fb8540a05c43faf636dd68647747b074#gistcomment-2830503).

Compares each dependency with `isEqual` function to memoize value from `factory`.

```diff
 export function useFetch(url, options) {
-  const cachedOptionsRef = useRef();
-
-  if (
-    !cachedOptionsRef.current ||
-    !_.isEqual(options, cachedOptionsRef.current)
-  ) {
-    cachedOptionsRef.current = options;
-  }
+  const cachedOptions = useMemoWith(() => options, [options], _.isEqual);

   useEffect(() => {
     // Perform fetch
-  }, [url, cachedOptionsRef.current]);
+  }, [url, cachedOptions]);
 }

```

#### `usePrevious(value)`

> Inspired by [How to get the previous props or state?](https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state)

Stores `value` used in previous render.

```diff
 function Counter() {
-  const prevCountRef = useRef();
   const [count, setCount] = useState(0);
-
-  useEffect(() => {
-    prevCountRef.current = count;
-  });
+  const prevCount = usePrevious(count);

   return (
     <h1>
-      Now: {count}, before: {prevCountRef.current}
+      Now: {count}, before: {prevCount}
     </h1>
   );
 }
```

#### `usePromise(factory, deps)`

Handles loading of promises created by `factory` function.

```diff
const [filter, setFilter] = useState('')
- const [value, setValue] = useState();
- const [error, setError] = useState()
- useEffect(() => {
-   const controller = new AbortController();
-   const runEffect = async () => {
-     try {
-       const value = await fetch(
-         "https://foo.bars/api?filter=" + filter,
-         { signal: controller.signal }
-       );
-
-       setValue(value);
-     } catch (error) {
-       if (err.name === 'AbortError') {
-         console.log("Request was canceled via controller.abort");
-         return;
-       }
-
-       setError(error)
-     }
-   };
-   runEffect();
-   return () => controller.abort()
- }, [filter]);
+ const { value, error } = usePromise(({ abortSignal }) => fetch(
+  "https://foo.bars/api?filter=" + filter,
+   { signal: abortSignal }
+ ), [filter])
```

#### `usePureMemo(deps, isEqual)`

Returns next `deps` only when they were changed based on `isEqual` result.

#### `usePureMemo(factory, deps, isEqual)`

Works like `useMemoWith`, but also compares return value.

```diff
 export function useFetch(url, options) {
-  const cachedOptionsRef = useRef();
-
-  if (
-    !cachedOptionsRef.current ||
-    !_.isEqual(options, cachedOptionsRef.current)
-  ) {
-    cachedOptionsRef.current = options;
-  }
+  const cachedOptions = usePureMemo(() => options, [options], _.isEqual);

   useEffect(() => {
     // Perform fetch
-  }, [url, cachedOptionsRef.current]);
+  }, [url, cachedOptions]);
 }

```

#### `useValueRef(value)`

> Inspired by [How to read an often-changing value from useCallback?](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

Works like `useRef`, but keeps it's `ref` in sync with `value` on every call.

```diff
function Form() {
  const [text, updateText] = useState('');
+  const textRef = useValueRef(text);
-  const textRef = useRef();
-
- useEffect(() => {
-   textRef.current = text; // Write it to the ref
- });

  const handleSubmit = useCallback(() => {
    const currentText = textRef.current; // Read it from the ref
    alert(currentText);
  }, [textRef]); // Don't recreate handleSubmit like [text] would do

  return (
    <>
      <input value={text} onChange={e => updateText(e.target.value)} />
      <ExpensiveTree onSubmit={handleSubmit} />
    </>
  );
}
```

#### `useWhenValueChanges(value, effect, isEqual)`

Works like `useEffect`, but runs effect only when `value` compared by `isEqual` (`Object.is` if not provided). It also passes the previous `value` as an effect argument.

```diff
function List({ disptach, page, selectedId }) {
-  const isInitial = useRef(true);
  useEffect(() => {
-    isInitial.current = true;
    dispatch({ type: "FETCH_LIST", page });
  }, [page, dispatch]);
  useEffect(() => {
    dispatch({ type: "FETCH_ITEM", id: selectedId });
  }, [selectedId, dispatch]);
-  useEffect(() => {
-    if (isInitial.current) {
-      isInitial.current = false;
-    } else if (!selectedId) {
-      dispatch({ type: "FETCH_LIST", page });
-    }
-  }, [page, selectedId, dispatch]);
+  useWhenValueChanges(selectedId, () => {
+    if (!selectedId) {
+      dispatch({ type: "FETCH_LIST", page });
+    }
+  });
}
```

### Utilities

#### `areDepsEqualWith(hookName, nextDeps, prevDeps, isEqual)`

Compares each dependency with `isEqual` function.
