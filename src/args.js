// `error.constructorArgs` can be set to define specific arguments to call
// when instantiating the error during parsing.
// We do not allow the `arguments` keyword since it is deprecated.
export const setConstructorArgs = ({ constructorArgs, message }) =>
  Array.isArray(constructorArgs)
    ? packConstructorArgs(constructorArgs, message)
    : []

// Compress `constructorArgs` to keep the output small without changing its
// semantics:
//  - If the first constructor argument is the `error.message`, then we replace
//    by `null` since it can be retrieved during parsing
//  - If the arguments are the same as the default ones during parsing,
//    i.e. `message` and empty object, then we omit `constructorArgs`
const packConstructorArgs = (constructorArgs, message) => {
  if (constructorArgs[0] !== message) {
    return [['constructorArgs', constructorArgs]]
  }

  return canUseDefaultArgs(constructorArgs)
    ? []
    : // eslint-disable-next-line unicorn/no-null
      [['constructorArgs', [null, ...constructorArgs.slice(1)]]]
}

const canUseDefaultArgs = (constructorArgs) =>
  constructorArgs.length === 1 ||
  (constructorArgs.length === 2 && isEmptyObject(constructorArgs[1]))

const isEmptyObject = (value) =>
  typeof value === 'object' && value !== null && Object.keys(value).length === 0

// Reverse of `packConstructorArgs()`
export const unpackConstructorArgs = (constructorArgs, message) =>
  constructorArgs[0] === null
    ? [message, ...constructorArgs.slice(1)]
    : constructorArgs
