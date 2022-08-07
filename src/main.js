import { excludeKeys } from 'filter-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

// We apply `normalize-exception` to ensure a strict input
export const serialize = function (error) {
  const errorA = normalizeException(error)
  const object = errorToObject(errorA)
  const objectA = safeJsonValue(object)
  return objectA
}

// Convert an error instance to a plain object.
// We exclude non-core error properties that either:
//  - Are non-enumerable
//     - Reason: most likely not meant to be serialized
//  - Are inherited
//     - They cannot be parsed back as inherited
//     - If the same Error type is used during parsing, they are kept anyway
//  - Have symbol keys
//     - Reason: not supported by JSON
const errorToObject = function (error) {
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
  return value === undefined ? undefined : [propName, recurseCoreProp(value)]
}

// Convert `error.cause|errors` to plain objects recursively.
// `normalize-exception` already normalized those recursively, including
// handling cycles.
const recurseCoreProp = function (value, propName) {
  if (propName === 'cause') {
    return errorToObject(value)
  }

  if (propName === 'errors') {
    return value.map(errorToObject)
  }

  return value
}

const getNonCoreProps = function (error) {
  return Object.keys(error)
    .filter(isNonCorePropName)
    .map((propName) => getNonCoreProp(error, propName))
    .filter(Boolean)
}

const isNonCorePropName = function (propName) {
  return !CORE_PROPS_SET.has(propName) && !IGNORED_PROPS.has(propName)
}

// We ignore `error.toJSON()` to ensure the plain object can be parsed back
const IGNORED_PROPS = new Set(['toJSON'])

// We handle error properties which throw when retrieved due to being getters
// or proxies.
//  - This is already done for core error properties by `normalize-exception`
const getNonCoreProp = function (error, propName) {
  try {
    const value = error[propName]
    return value === undefined ? undefined : [propName, value]
  } catch {}
}

// We apply `normalize-exception` to ensure a strict output
export const parse = function (object) {
  const error = objectToError(object)
  const errorA = normalizeException(error)
  return errorA
}

// Convert a plain object to an error instance.
// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const objectToError = function (object) {
  const ErrorType = Error
  const error = new ErrorType(object.message)
  setCoreProps(error, object)
  const nonCoreProps = excludeKeys(object, CORE_PROPS)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, nonCoreProps)
  return error
}

const setCoreProps = function (error, object) {
  Object.keys(CORE_PROPS).forEach((propName) => {
    setCoreProp(error, object, propName)
  })
}

const setCoreProp = function (error, object, propName) {
  const value = object[propName]

  if (value === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value,
    enumerable: false,
    writable: true,
    configurable: true,
  })
}

const CORE_PROPS = ['name', 'message', 'stack', 'cause', 'errors']
const CORE_PROPS_SET = new Set(CORE_PROPS)
