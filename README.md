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

```javascript
function LoginForm({ onSubmit }) {
  const handleSubmit = useCallbackProxy(onSubmit);

  return <Form onSubmit={handleSubmit} />;
}
```

#### `useMemoOnce(factory)`

> Inspired by [How to create expensive objects lazily?](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily)

Runs factory only once and writes value in component `ref`.

```javascript
function RenderTime() {
  const renderTime = useMemoOnce(() => new Date());

  return <>{renderTime.toDateString()}</>;
}
```

#### `useMemoWith(factory, isEqual, deps)`

Compares each dependency with `isEqual` function to memoize value from `factory`.

```javascript
function LoginForm({ user }) {
  const initialValues = useMemoWith(
    () => ({ email: user.email, phone: user.phone }),
    (a, b) => a === b || (a.email === b.email && a.phone === b.phone),
    [user],
  );

  return <Form initialValues={initialValues} />;
}
```

#### `useValueRef(value)`

> Inspired by [How to read an often-changing value from useCallback?](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)

Works like `useRef`, buy updates `ref` on every call.

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
