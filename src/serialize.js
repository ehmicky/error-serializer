import { CORE_PROPS, getNonCoreProps } from './core.js'

// Convert an error instance to a plain object.
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
