// `error.constructorArgs` can be set to define specific arguments to call
// when instantiating the error during parsing.
export const setConstructorArgs = function ({ constructorArgs }) {
  if (
    Object.prototype.toString.call(constructorArgs) === '[object Arguments]'
  ) {
    return [['constructorArgs', [...constructorArgs]]]
  }

  if (Array.isArray(constructorArgs)) {
    return [['constructorArgs', constructorArgs]]
  }

  return []
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
  if (Array.isArray(constructorArgs)) {
    return constructorArgs
  }

  return ErrorClass === globalThis.AggregateError
    ? [[], message, {}]
    : [message, {}]
}
