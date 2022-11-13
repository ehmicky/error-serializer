[![Node](https://img.shields.io/badge/-Node.js-808080?logo=node.js&colorA=404040&logoColor=66cc33)](https://www.npmjs.com/package/error-serializer)
[![Browsers](https://img.shields.io/badge/-Browsers-808080?logo=firefox&colorA=404040)](https://unpkg.com/error-serializer?module)
[![TypeScript](https://img.shields.io/badge/-Typed-808080?logo=typescript&colorA=404040&logoColor=0096ff)](/types/main.d.ts)
[![Codecov](https://img.shields.io/badge/-Tested%20100%25-808080?logo=codecov&colorA=404040)](https://codecov.io/gh/ehmicky/error-serializer)
[![Minified size](https://img.shields.io/bundlephobia/minzip/error-serializer?label&colorA=404040&colorB=808080&logo=webpack)](https://bundlephobia.com/package/error-serializer)
[![Twitter](https://img.shields.io/badge/-Twitter-808080.svg?logo=twitter&colorA=404040)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/-Medium-808080.svg?logo=medium&colorA=404040)](https://medium.com/@ehmicky)

Convert errors to/from plain objects.

# Features

- Ensures errors are [safe to serialize with JSON](#json-safety)
- Can be used as [`error.toJSON()`](#errortojson)
- [Deep serialization/parsing](#shallow)
- [Custom serialization/parsing](#custom-serializationparsing) (e.g. YAML or
  `process.send()`)
- Keeps both native (`TypeError`, etc.) and [custom](#classes) error classes
- Preserves errors' [additional properties](#additional-error-properties)
- Can keep [constructor's arguments](#constructors)
- Works [recursively](#errorcause-and-aggregateerror) with
  [`error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
  and
  [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
- [Normalizes](#normalize) invalid errors
- Safe: this never throws

# Example

```js
import { serialize, parse } from 'error-serializer'

const error = new TypeError('example')
const errorObject = serialize(error)
// Plain object: { name: 'TypeError', message: 'example', stack: '...' }

const errorString = JSON.stringify(errorObject)
const newErrorObject = JSON.parse(errorString)

const newError = parse(newErrorObject)
// Error instance: 'TypeError: example ...'
```

# Install

```bash
npm install error-serializer
```

This package works in both Node.js >=14.18.0 and
[browsers](https://raw.githubusercontent.com/ehmicky/dev-tasks/main/src/tasks/build/browserslist).
It is an ES module and must be loaded using
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

#### shallow

_Type_: `boolean`\
_Default_: `false`

Unless this option is `true`, nested errors are also serialized. They can be
inside other errors, plain objects or arrays.

```js
serialize([{ error: new Error('test') }]) // [{ error: { name: 'Error', ... } }]
serialize([{ error: new Error('test') }], { shallow: true }) // [{ error: Error }]
```

#### normalize

_Type_: `boolean`\
_Default_: `false`

Convert `errorInstance` to an `Error` instance if it is not one.

```js
serialize('example') // 'example'
serialize('example', { normalize: true }) // { name: 'Error', message: 'example', ... }
```

## parse(errorObject, options?)

`errorObject` `any`\
`options` [`Options?`](#options)\
_Return value_: `Error`

Convert an error plain object into an `Error` instance.

### Options

Object with the following optional properties.

#### classes

_Type_: `object`

Custom error classes to keep when parsing.

- Each key is an `errorObject.name`
- Each value is the error class to use

```js
const errorObject = serialize(new CustomError('example'))
// `CustomError` class is kept
const error = parse(errorObject, { classes: { CustomError } })
// Map `CustomError` to another class
const otherError = parse(errorObject, { classes: { CustomError: TypeError } })
```

#### shallow

_Type_: `boolean`\
_Default_: `false`

Unless this option is `true`, nested error plain objects are also parsed.

```js
const errorObject = serialize(new Error('test'))

parse([{ error: errorObject }])
// [{ error: Error }]
parse([{ error: errorObject }], { shallow: true })
// [{ error: { name: 'Error', ... } }]
```

#### normalize

_Type_: `boolean`\
_Default_: `false`

Convert `errorObject` to an error plain object if it is not one.

```js
parse('example') // 'example'
parse('example', { normalize: true }) // Error: example
```

# Usage

## JSON safety

Error plain objects are always
[safe to serialize with JSON](https://github.com/ehmicky/safe-json-value).

<!-- eslint-disable no-unused-expressions -->

```js
const error = new Error('example')
error.cycle = error

// Cycles make `JSON.stringify()` throw, so they are removed
serialize(error).cycle // undefined
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

error.toJSON()
// { name: 'CustomError', message: 'example', stack: '...' }
JSON.stringify(error)
// '{"name":"CustomError","message":"example","stack":"..."}'
```

## Custom serialization/parsing

Errors are converted to/from plain objects, not strings. This allows any
serialization/parsing logic to be performed.

```js
import { dump, load } from 'js-yaml'

const error = new Error('example')
const errorObject = serialize(error)
const errorYamlString = dump(errorObject)
// name: Error
// message: example
// stack: Error: example ...
const newErrorObject = load(errorYamlString)
const newError = parse(newErrorObject) // Error: example
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

## Constructors

By default, when an error with custom [`classes`](#classes) is parsed, its
constructor is not called. In most cases, this is not a problem since any
property previously set by that constructor is still preserved, providing it is
serializable and enumerable.

However, if the `error.constructorArgs` property is set, the constructor will be
called with those arguments. It it throws, `Error` will be used as a fallback
error class.

<!-- eslint-disable fp/no-class, fp/no-this, fp/no-mutation -->

```js
class CustomError extends Error {
  constructor(prefix, message) {
    super(`${prefix} - ${message}`)
    this.constructorArgs = [prefix, message]
  }
}
CustomError.prototype.name = 'CustomError'

const error = new CustomError('Prefix', 'example')

const errorObject = serialize(error)
// This calls `new CustomError('Prefix', 'example')`
const newError = parse(errorObject, { classes: { CustomError } })
```

# Related projects

- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors
  like it's 2022 🔮
- [`modern-errors-serialize`](https://github.com/ehmicky/modern-errors-serialize):
  Serialize/parse errors
- [`error-custom-class`](https://github.com/ehmicky/error-custom-class): Create
  one error class
- [`error-class-utils`](https://github.com/ehmicky/error-class-utils): Utilities
  to properly create error classes
- [`normalize-exception`](https://github.com/ehmicky/normalize-exception):
  Normalize exceptions/errors
- [`is-error-instance`](https://github.com/ehmicky/is-error-instance): Check if
  a value is an `Error` instance
- [`merge-error-cause`](https://github.com/ehmicky/merge-error-cause): Merge an
  error with its `cause`
- [`set-error-class`](https://github.com/ehmicky/set-error-class): Properly
  update an error's class
- [`set-error-message`](https://github.com/ehmicky/set-error-message): Properly
  update an error's message
- [`set-error-props`](https://github.com/ehmicky/set-error-props): Properly
  update an error's properties
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
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4?s=100" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/error-serializer/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/error-serializer/commits?author=ehmicky" title="Documentation">📖</a></td>
      <td align="center"><a href="https://github.com/papb"><img src="https://avatars.githubusercontent.com/u/20914054?v=4?s=100" width="100px;" alt="Pedro Augusto de Paula Barbosa"/><br /><sub><b>Pedro Augusto de Paula Barbosa</b></sub></a><br /><a href="https://github.com/ehmicky/error-serializer/issues?q=author%3Apapb" title="Bug reports">🐛</a> <a href="https://github.com/ehmicky/error-serializer/commits?author=papb" title="Documentation">📖</a></td>
    </tr>
  </tbody>
  <tfoot>

  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
