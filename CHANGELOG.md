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

- A second argument `error` is now passed to
  [`afterSerialize()`](README.md#afterserializeerrorinstance)
- A second argument `errorObject` is now passed to
  [`afterParse()`](README.md#afterparseerrorobject)

# 4.0.0

## Breaking changes

- When parsing an error and the [`classes` option](README.md#classes) was
  defined, the `constructor` is not called anymore unless
  [`error.constructorArgs`](README.md#constructors) was set

## Features

- Added options [`beforeSerialize()`](README.md#beforeserializeerrorinstance),
  [`afterSerialize()`](README.md#afterserializeerrorinstance),
  [`beforeParse()`](README.md#beforeparseerrorobject) and
  [`afterParse()`](README.md#afterparseerrorobject) to
  [customize](README.md#events) the serialization and parsing of each error

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

- Constructors parameters can now be kept
  [by setting `error.constructorArgs`](README.md#constructors-arguments).

# 3.0.0

## Breaking changes

- The `loose` option was renamed to [`normalize`](README.md#normalize). Its
  value has been inverted: `loose: true` is now `normalize: false`.
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
