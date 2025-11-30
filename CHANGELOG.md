# 8.0.2

## Types

- Fix TypeScript types of `error.cause` and `error.errors` (#17)

# 8.0.1

## Documentation

- Improve documentation in `README.md`

# 8.0.0

## Breaking changes

- The
  [`beforeSerialize(errorInstance)`](https://github.com/ehmicky/error-serializer/tree/7.0.0#beforeserializeerrorinstance)
  and
  [`afterSerialize(errorInstance, errorObject)`](https://github.com/ehmicky/error-serializer/tree/7.0.0#afterserializeerrorinstance-errorobject)
  options have been removed. Please use the
  [`transformObject(errorObject, errorInstance)`](README.md#transformobjecterrorobject-errorinstance)
  new option instead.

```diff
serialize(error, {
-  beforeSerialize: (error) => {
-    error.date = error.date.toString()
-  },
-  afterSerialize: (error, errorObject) => {
-    error.date = new Date(error.date)
-  },
+  transformObject: (errorObject, error) => {
+    errorObject.date = errorObject.date.toString()
+  },
})
```

- The
  [`beforeParse(errorObject)`](https://github.com/ehmicky/error-serializer/tree/7.0.0#beforeparseerrorobject)
  and
  [`afterParse(errorObject, errorInstance)`](https://github.com/ehmicky/error-serializer/tree/7.0.0#afterparseerrorobject-errorinstance)
  options have been removed. Please use the
  [`transformInstance(errorInstance, errorObject)`](README.md#transforminstanceerrorinstance-errorobject)
  new option instead.

```diff
parse(errorObject, {
-  beforeParse: (errorObject) => {
-    errorObject.date = new Date(errorObject.date)
-  },
-  afterParse: (errorObject, error) => {
-    errorObject.date = errorObject.date.toString()
-  },
+  transformInstance: (error, errorObject) => {
+    error.date = new Date(error.date)
+  },
})
```

## Features

- Add the [`include`](README.md#include) and [`exclude`](README.md#exclude)
  options to pick/omit specific properties. For example, this can be used to
  omit [error additional properties](README.md#omit-additional-error-properties)
  or [stack trace](README.md#omit-stack-traces).
- Add the
  [`transformArgs(constructorArgs)`](README.md#transformargsconstructorargs-errorobject-errorclass)
  option to transform an error message during
  [`parse(errorObject)`](README.md#parseerrorobject-options).
- The `errorObject` passed to
  [`parse(errorObject)`](README.md#parseerrorobject-options) previously required
  the `name`, `message` and `stack` properties. Only the `message` property is
  now required. In other words, `parse({message})` now works.

# 7.0.0

## Breaking changes

- Minimal supported Node.js version is now `18.18.0`

# 6.0.1

## Dependencies

- Upgrade internal dependencies

# 6.0.0

## Breaking changes

- Minimal supported Node.js version is now `16.17.0`

# 5.1.0

## Features

- Improve documentation

# 5.0.0

## Breaking changes

- The `normalize` option was renamed to [`loose`](README.md#loose). Its value
  has been inverted: `normalize: false` is now `loose: true`.
- The default value of the `loose` option is now `false`.
  - If the argument to `serialize()` is not an error instance, it is now
    normalized to one, unless `loose: true` is used
  - If the argument to `parse()` is not an error plain object, it is now
    normalized to one, unless `loose: true` is used

# 4.2.0

## Features

- Improve input validation

# 4.1.0

## Features

- A second argument `error` is now passed to `afterSerialize()`
- A second argument `errorObject` is now passed to `afterParse()`

# 4.0.0

## Breaking changes

- When parsing an error and the [`classes` option](README.md#classes) was
  defined, the `constructor` is not called anymore unless
  [`error.constructorArgs`](README.md#constructors) was set

## Features

- Added options
  [`beforeSerialize()`](https://github.com/ehmicky/error-serializer/tree/7.0.0#beforeserializeerrorinstance),
  [`afterSerialize()`](https://github.com/ehmicky/error-serializer/tree/7.0.0#afterserializeerrorinstance-errorobject),
  [`beforeParse()`](https://github.com/ehmicky/error-serializer/tree/7.0.0#beforeparseerrorobject)
  and
  [`afterParse()`](https://github.com/ehmicky/error-serializer/tree/7.0.0#afterparseerrorobject-errorinstance)
  to [customize](https://github.com/ehmicky/error-serializer/tree/7.0.0#events)
  the serialization and parsing of each error

# 3.7.0

## Features

- Improve tree-shaking support

# 3.6.0

## Features

- Add browser support

# 3.5.1

## Bug fixes

- Fix `package.json`

# 3.5.0

- Switch to MIT license

# 3.4.0

## Features

- Improve error detection using
  [`is-error-instance`](https://github.com/ehmicky/is-error-instance)

# 3.3.0

## Features

- Improve [`shallow` option](README.md#shallow) with `serialize()`

# 3.2.0

## Features

- Improve support for SpiderMonkey and JavaScriptCore

# 3.1.0

## Features

- Constructors parameters can now be kept by setting `error.constructorArgs`

# 3.0.0

## Breaking changes

- The `loose` option was renamed to `normalize`. Its value has been inverted:
  `loose: true` is now `normalize: false`.
- The default value of the `normalize` option is now `false`.
  - If the argument to `serialize()` is not an error instance, it is not
    normalized to one anymore, unless `normalize: true` is used
  - If the argument to `parse()` is not an error plain object, it is not
    normalized to one anymore, unless `normalize: true` is used

## Features

- [Serialization](README.md#shallow) and [parsing](README.md#shallow-1) are now
  performed deeply. The [`shallow: true`](README.md#shallow) option can be used
  to keep them shallow.

# 2.0.0

## Breaking changes

- Rename `types` option to [`classes`](README.md#classes)

# 1.4.0

## Features

- Improve error handling

# 1.3.4

## Bug fixes

- Fix TypeScript types of `types` option

# 1.3.3

## Bug fixes

- Fix TypeScript types of `types` option

# 1.3.2

## Bug fixes

- Fix main functions' return value's TypeScript types

# 1.3.1

## Bug fixes

- Fix main function's return value's type

# 1.3.0

## Features

- Add [`loose` option](README.md#loose) to invalid arguments as is
- Add support for
  [deep serialization/parsing](README.md#deep-serializationparsing)

# 1.2.1

## Bug fixes

- Make it work with cross-realm errors

# 1.2.0

## Features

- Reduce npm package size

# 1.1.0

Initial release.
