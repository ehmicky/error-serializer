import { CORE_PROPS, getNonCoreProps } from './core.js'

// Convert an error instance to a plain object.
// We exclude non-core error properties that either:
//  - Are non-enumerable
//     - Reason: most likely not meant to be serialized
//  - Are inherited
//     - They cannot be parsed back as inherited
//     - If the same Error type is used during parsing, they are kept anyway
//  - Have symbol keys
//     - Reason: not supported by JSON
export const serializeError = function (error) {
  const coreProps = getCoreProps(error)
  const nonCoreProps = getNonCoreProps(error)
  const object = Object.fromEntries([...coreProps, ...nonCoreProps])
  return object
}

const getCoreProps = function (error) {
  return CORE_PROPS.map((propName) => getCoreProp(error, propName)).filter(
    Boolean,
  )
}

const getCoreProp = function (error, propName) {
  const value = error[propName]
  return value === undefined
    ? undefined
    : [propName, recurseCorePropToObject(value, propName)]
}

// Convert `error.cause|errors` to plain objects recursively.
// `normalize-exception` already normalized those recursively, including
// handling cycles.
const recurseCorePropToObject = function (value, propName) {
  if (propName === 'cause') {
    return serializeError(value)
  }

  if (propName === 'errors') {
    return value.map(serializeError)
  }

  return value
}
