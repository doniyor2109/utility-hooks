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

Unlike `useCallback`, `useCallbackProxy` does not accept second argument, so it updates only in `useEffect` call.

> This can lead to unexpected bugs in function closures when called before `useEffect` trigger.

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
function App({ cache, children }) {
  const client = useMemoOnce(() => createApolloClient({ cache }));

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
```

#### `useMemoWith(factory, isEqual, deps)`

Compares each dependency with `isEqual` function to memoize value from `factory`.

```javascript
function LoginForm({ user }) {
  const initialValues = useMemoOnce(
    () => ({
      email: user && user.email,
      phone: user && user.phone,
    }),
    _.isEqual,
    [user],
  );

  return <Form initialValues={initialValues} />;
}
```

### Utilities

#### `areDepsEqualWith(hookName, nextDeps, prevDeps, isEqual)`

Compares each dependency with `isEqual` function.
