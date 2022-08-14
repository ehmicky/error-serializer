[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/error-serializer.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/error-serializer)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray&logoColor=0096ff)](/src/main.d.ts)
[![Node](https://img.shields.io/node/v/error-serializer.svg?logo=node.js&logoColor=66cc33)](https://www.npmjs.com/package/error-serializer)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Convert errors to/from plain objects.

# Features

- Ensures errors are [safe to serialize with JSON](#json-safety)
- Can be used as [`error.toJSON()`](#errortojson)
- [Custom serialization logic](#custom-serialization) (e.g. YAML or
  `process.send()`)
- Keeps both native (`TypeError`, etc.) and [custom](#types) error types
- Preserves errors' [additional properties](#additional-error-properties)
- Works [recursively](#errorcause-and-aggregateerror) with
  [`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
  and
  [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
- [Normalizes](#error-normalization) invalid errors
- Safe: this never throws

# Example

```js
import { serialize, parse } from 'error-serializer'

const error = new TypeError('example')
const errorObject = serialize(error)
// Plain object: { name: 'TypeError', message: 'example', stack: '...' }

const errorString = JSON.serialize(errorObject)
const newErrorObject = JSON.parse(errorString)

const newError = parse(newErrorObject)
// Error instance: 'TypeError: example ...'
```

# Install

```bash
npm install error-serializer
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## serialize(errorInstance, options?)

`errorInstance` `any`\
`options` [`Options?`](#options)\
_Return value_: `object`

Convert an `Error` instance into a plain object.

### Options

Object with the following optional properties.

#### loose

_Type_: `boolean`\
_Default_: `false`

If this option is `true` and `errorInstance` is not an `Error` instance, it is
returned as is, instead of being converted to a plain object.

## parse(errorObject, options?)

`errorObject` `any`\
`options` [`Options?`](#options)\
_Return value_: `Error`

Convert an error plain object into an `Error` instance.

### Options

Object with the following optional properties.

#### types

_Type_: `object`

Custom error types to keep when parsing.

- Each key is an `errorObject.name`.
- Each value is the error type to use. The constructor will be called with a
  single `message` argument. It it throws, `Error` will be used as the error
  type instead.

```js
const errorObject = serialize(new CustomError('example'))
// `CustomError` type is kept
const error = parse(errorObject, { types: { CustomError } })
// Map `CustomError` to another type
const otherError = parse(errorObject, { types: { CustomError: TypeError } })
```

#### loose

_Type_: `boolean`\
_Default_: `false`

If this option is `true` and `errorObject` is not an error plain object, it is
returned as is, instead of being converted to an `Error` instance.

# Usage

## JSON safety

Error plain objects are always
[safe to serialize with JSON](https://github.com/ehmicky/safe-json-value).

```js
const error = new Error('example')
error.cycle = error

// Cycles make `JSON.serialize()` throw, so they are removed
console.log(serialize(error).cycle) // {}
```

## Custom serialization

[`serialize()`](#serializeerrorinstance) returns a plain object, not a string.
This allows any serialization logic to be performed.

```js
import { dump } from 'js-yaml'

const error = new Error('example')
const errorObject = serialize(error)
const errorYamlString = dump(errorObject)
// name: Error
// message: example
// stack: Error: example ...
```

## `error.toJSON()`

[`serialize()`](#serializeerrorinstance) can be used as
[`error.toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior).

<!-- eslint-disable fp/no-class, fp/no-this -->

```js
class CustomError extends Error {
  /* constructor(...) { ... } */

  toJSON() {
    return serialize(this)
  }
}
const error = new CustomError('example')

console.log(error.toJSON())
// { name: 'CustomError', message: 'example', stack: '...' }
console.log(JSON.stringify(error))
// '{"name":"CustomError","message":"example","stack":"..."}'
```

## Additional error properties

```js
const error = new TypeError('example')
error.prop = true

const errorObject = serialize(error)
console.log(errorObject.prop) // true
const newError = parse(errorObject)
console.log(newError.prop) // true
```

## `error.cause` and `AggregateError`

```js
const innerErrors = [new Error('one'), new Error('two')]
const cause = new Error('three')
const error = new AggregateError(innerErrors, 'four', { cause })

const errorObject = serialize(error)
// {
//   name: 'AggregateError',
//   message: 'four',
//   stack: '...',
//   cause: { name: 'Error', message: 'three', stack: '...' },
//   errors: [{ name: 'Error', message: 'one', stack: '...' }, ...],
// }
const newError = parse(errorObject)
// AggregateError: four
//   [cause]: Error: three
//   [errors]: [Error: one, Error: two]
```

## Error normalization

Invalid error instances or objects are
[normalized](https://github.com/ehmicky/normalize-exception).

```js
// Normalizes invalid error: not an `Error` instance
console.log(serialize('example')) // { name: 'Error', message: 'example', ... }

// Normalizes `error.name`: not a string
console.log(parse({ name: false, message: 'example' })) // Error: example
```

# Related projects

- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors
  like it's 2022 🔮
- [`create-error-types`](https://github.com/ehmicky/create-error-types): Create
  multiple error types
- [`error-type`](https://github.com/ehmicky/error-type): Create one error type
- [`normalize-exception`](https://github.com/ehmicky/normalize-exception):
  Normalize exceptions/errors
- [`merge-error-cause`](https://github.com/ehmicky/merge-error-cause): Merge an
  error with its `cause`
- [`error-cause-polyfill`](https://github.com/ehmicky/error-cause-polyfill):
  Polyfill `error.cause`
- [`handle-cli-error`](https://github.com/ehmicky/handle-cli-error): 💣 Error
  handler for CLI applications 💥
- [`safe-json-value`](https://github.com/ehmicky/safe-json-value): ⛑️ JSON
  serialization should never fail
- [`log-process-errors`](https://github.com/ehmicky/log-process-errors): Show
  some ❤ to Node.js process errors

# Support

For any question, _don't hesitate_ to [submit an issue on GitHub](../../issues).

Everyone is welcome regardless of personal background. We enforce a
[Code of conduct](CODE_OF_CONDUCT.md) in order to promote a positive and
inclusive environment.

# Contributing

This project was made with ❤️. The simplest way to give back is by starring and
sharing it online.

If the documentation is unclear or has a typo, please click on the page's `Edit`
button (pencil icon) and suggest a correction.

If you would like to help us fix a bug or add a new feature, please check our
[guidelines](CONTRIBUTING.md). Pull requests are welcome!

<!-- Thanks go to our wonderful contributors: -->

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore -->
<!--
<table><tr><td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/error-serializer/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/error-serializer/commits?author=ehmicky" title="Documentation">📖</a></td></tr></table>
 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
