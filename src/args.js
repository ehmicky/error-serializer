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
// Static properties are still set after initialization, so `constructorArgs`
// is only useful with custom `classes`.
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
