[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/error-serializer.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/error-serializer)
[![Node](https://img.shields.io/node/v/error-serializer.svg?logo=node.js)](https://www.npmjs.com/package/error-serializer)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray)](/src/main.d.ts)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Convert errors to/from plain objects.

# Features

- Keeps error types that either native (`TypeError`, `DOMException`, etc.) or
  custom
- Works recursively with
  [`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
  and
  [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
- Error plain objects are always
  [JSON-safe](https://github.com/ehmicky/safe-json-value)
- Tailored for JSON, but allows any JSON-compatible format, including YAML
- [Normalize invalid errors](https://github.com/ehmicky/normalize-exception)
- Safe: this never throws

# Examples

```js
import { serialize, parse } from 'error-serializer'

const errorObject = serialize(new TypeError('example'))
// Plain object: { name: 'TypeError', message: 'example', stack: '...' }
const error = parse(errorObject)
// Error instance: 'TypeError: example ...'
// `TypeError` type is kept
```

```js
// Keeps custom error types
const errorObject = serialize(new CustomError('example'))
// `CustomError` type is kept
const error = parse(errorObject, { types: { CustomError } })
// Map `CustomError` to another type
const otherError = parse(errorObject, { types: { CustomError: TypeError } })
```

```js
// Additional error properties are kept
const error = new TypeError('example')
error.prop = true
const errorObject = serialize(error)
console.log(errorObject.prop) // true
console.log(parse(errorObject).prop) // true
```

```js
// Works with `error.cause` and `AggregateError`
const error = new AggregateError([new Error('one')], 'two', {
  cause: new Error('three'),
})
const errorObject = serialize(error)
// {
//   name: 'AggregateError',
//   message: 'two',
//   stack: '...',
//   cause: { name: 'Error', message: 'three', stack: '...' },
//   errors: [{ name: 'Error', message: 'two', stack: '...' }],
// }
console.log(parse(errorObject))
// AggregateError: two
//   [cause]: Error: three
//   [errors]: [Error: one]
```

```js
// Error plain objects are always JSON-safe
const error = new Error('example')
error.cycle = error
console.log(serialize(error).cycle) // {}
```

```js
// Does not serialize to strings, allowing any serialization logic to be
// performed
import { dump } from 'js-yaml'
console.log(dump(serialize(new Error('example'))))
// name: Error
// message: example
// stack: Error: example ...
```

```js
// Invalid error instances or objects are normalized
console.log(serialize('example')) // { name: 'Error', message: 'example', ... }
console.log(parse({ message: false })) // Error: false
```

# Install

```bash
npm install error-serializer
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## serialize(errorInstance)

`errorInstance` `any`\
_Return value_: `object`

Convert an `Error` instance into a plain object.

## parse(errorObject, options?)

`errorObject` `any`\
`options` [`Options?`](#options)\
_Return value_: `Error`

Convert an error plain object into an `Error` instance.

### Options

Object with the following properties.

#### types

_Type_: `object`

Custom error types to keep when parsing.

Each key is an `errorObject.name`. Each value is the error type/constructor to
use.

# Related projects

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
