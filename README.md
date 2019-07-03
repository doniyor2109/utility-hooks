# utility-hooks

> Collection of low-level React hooks.

[![npm version](https://img.shields.io/npm/v/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/utility-hooks.svg)](https://bundlephobia.com/result?p=utility-hooks)
[![npm type definitions](https://img.shields.io/npm/types/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![npm downloads](https://img.shields.io/npm/dm/utility-hooks.svg)](https://npmjs.com/utility-hooks)
[![Build Status](https://travis-ci.com/umidbekkarimov/utility-hooks.svg?branch=master)](https://travis-ci.com/umidbekkarimov/utility-hooks)
[![codecov](https://codecov.io/gh/umidbekkarimov/utility-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/umidbekkarimov/utility-hooks)
[![npm license](https://img.shields.io/npm/l/utility-hooks.svg)](https://npmjs.com/utility-hooks)

### Hooks

#### `useCallbackProxy(callback)`

> Inspired by [How to read an often-changing value from useCallback?](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

Unlike `useCallback`, `useCallbackProxy` does not accept second argument and stores original `callback` in ref.

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
+  const handleSubmit = useCallbackProxy(() => {
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

#### `useConstant(factory)`

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

##### Static checking with `react-hooks/exhaustive-deps`

```diff
 {
-  "react-hooks/exhaustive-deps": ["warn"]
+  "react-hooks/exhaustive-deps": [
+    "warn",
+    {
+      "additionalHooks": "^(useMemoWith|useAnyOtherHook)$"
+    }
+  ]
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

### Utilities

#### `areDepsEqualWith(hookName, nextDeps, prevDeps, isEqual)`

Compares each dependency with `isEqual` function.
