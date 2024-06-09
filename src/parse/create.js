import setErrorClass from 'set-error-class'

import { unpackConstructorArgs } from '../args.js'

import { applyTransformArgs } from './transform_args.js'

// Custom error classes might throw due to missing parameters in the
// constructor. When this happens, we silently revert to `Error`.
export const createError = ({
  errorObject,
  errorObject: { name = DEFAULT_NAME, message, constructorArgs },
  transformArgs,
  classes,
}) => {
  const ErrorClass = getErrorClass(name, classes)

  if (!Array.isArray(constructorArgs) && transformArgs === undefined) {
    return createErrorWithoutArgs(message, ErrorClass)
  }

  const constructorArgsA = getConstructorArgs(constructorArgs, message)
  applyTransformArgs({
    transformArgs,
    constructorArgs: constructorArgsA,
    errorObject,
    ErrorClass,
  })
  return createErrorWithArgs(message, ErrorClass, constructorArgsA)
}

const DEFAULT_NAME = 'Error'

// Custom error classes can be passed to the `classes` option.
// The option is an object instead of an array, as this allows dissociating
// error names from their classes, since the parsing logic might have different
// sets of error instances than the serializing logic.
const getErrorClass = (name, classes) => {
  if (classes[name] !== undefined) {
    return classes[name]
  }

  return BUILTIN_CLASSES.has(name) && name in globalThis
    ? globalThis[name]
    : Error
}

// Common global error classes
const BUILTIN_CLASSES = new Set([
  'Error',
  'ReferenceError',
  'TypeError',
  'SyntaxError',
  'RangeError',
  'URIError',
  'EvalError',

  // This might not exist on some older platforms
  'AggregateError',

  // Browser-only
  'DOMException',
])

// Without `constructorArgs` or `transformArgs`, we default to not calling the
// `constructor` and setting the prototype manually.
// This means some logic performed in the constructor might be missing:
//  - Setting properties
//     - With non-enumerable or symbol keys
//     - Or that are not JSON-serializable
//  - Setting variables in an upper scope, including global variables
// This can sometimes be worked around by setting those separately after
// parsing, e.g. using an `init()` method.
const createErrorWithoutArgs = (message, ErrorClass) => {
  const error = new Error(message)
  setErrorClass(error, ErrorClass)
  return error
}

const getConstructorArgs = (constructorArgs, message) =>
  Array.isArray(constructorArgs)
    ? unpackConstructorArgs(constructorArgs, message)
    : [message]

// With `constructorArgs` or `transformArgs`, tries to call the constructor, or
// default to `Error`.
// Static properties are still set after initialization
//  - So `constructorArgs` is only useful with custom `classes`
//  - They might override properties set by the constructor
//     - In case those properties have been modified after initialization
//     - However, this means properties that had not been modified after
//       initialization but contain non-JSON-safe values are not preserved
//         - Unfortunately, we cannot know whether this is the case or not
//         - Also, this is simpler to understand as: non-JSON-safe values are
//           generally not serializable, either in options or static properties,
//           even when set by constructor
//            - Exception: properties where both:
//               - Value is set in constructor
//               - Key cannot be serialized, i.e. it is symbol, private, upper
//                 scope or non-enumerable
const createErrorWithArgs = (message, ErrorClass, constructorArgs) => {
  try {
    return new ErrorClass(...constructorArgs)
  } catch {
    return new Error(message)
  }
}
