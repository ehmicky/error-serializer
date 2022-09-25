// `error.constructorArgs` can be set to define specific arguments to call
// when instantiating the error during parsing.
// We do not allow the `arguments` keyword since it is deprecated.
export const setConstructorArgs = function ({ constructorArgs, message }) {
  return Array.isArray(constructorArgs)
    ? packConstructorArgs(constructorArgs, message)
    : []
}

// Compress `constructorArgs` to keep the output small without changing its
// semantics:
//  - If the first constructor argument is the `error.message`, then we replace
//    by `null` since it can be retrieved during parsing
//  - If the arguments are the same as the default ones during parsing,
//    i.e. `message` and empty object, then we omit `constructorArgs`
const packConstructorArgs = function (constructorArgs, message) {
  if (constructorArgs[0] !== message) {
    return [['constructorArgs', constructorArgs]]
  }

  return canUseDefaultArgs(constructorArgs)
    ? []
    : // eslint-disable-next-line unicorn/no-null
      [['constructorArgs', [null, ...constructorArgs.slice(1)]]]
}

const canUseDefaultArgs = function (constructorArgs) {
  return (
    constructorArgs.length === 1 ||
    (constructorArgs.length === 2 && isEmptyObject(constructorArgs[1]))
  )
}

const isEmptyObject = function (value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 0
  )
}

// Constructor arguments default to the error message and an empty object
// as second argument.
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
export const getConstructorArgs = function (
  constructorArgs,
  message,
  ErrorClass,
) {
  return Array.isArray(constructorArgs)
    ? unpackConstructorArgs(constructorArgs, message)
    : getDefaultArgs(message, ErrorClass)
}

const unpackConstructorArgs = function (constructorArgs, message) {
  return constructorArgs[0] === null
    ? [message, ...constructorArgs.slice(1)]
    : constructorArgs
}

const getDefaultArgs = function (message, ErrorClass) {
  return ErrorClass === globalThis.AggregateError
    ? [[], message, {}]
    : [message, {}]
}
