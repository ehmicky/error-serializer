/* eslint-disable max-lines */
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the types are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
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
  const value = safeGetProp(error, propName)
  return value === undefined
    ? undefined
    : [propName, recurseCorePropToObject(value)]
}

// Convert `error.cause|errors` to plain objects recursively.
// `normalize-exception` already normalized those recursively, including
// handling cycles.
const recurseCorePropToObject = function (value, propName) {
  if (propName === 'cause') {
    return errorToObject(value)
  }

  if (propName === 'errors') {
    return value.map(errorToObject)
  }

  return value
}

const getNonCoreProps = function (errorOrObject) {
  return Object.keys(errorOrObject)
    .filter(isNonCorePropName)
    .map((propName) => getNonCoreProp(errorOrObject, propName))
    .filter(Boolean)
}

const isNonCorePropName = function (propName) {
  return !CORE_PROPS_SET.has(propName) && !IGNORED_PROPS.has(propName)
}

// We ignore `error.toJSON()` to ensure the plain object can be parsed back
const IGNORED_PROPS = new Set(['toJSON'])

const getNonCoreProp = function (errorOrObject, propName) {
  const value = safeGetProp(errorOrObject, propName)
  return value === undefined ? undefined : [propName, value]
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (value, { types = {} } = {}) {
  const object = ensureObject(value)
  const error = objectToError(object, types)
  const errorA = normalizeException(error)
  return errorA
}

// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// `normalize-exception` also normalizes those afterwards.
const ensureObject = function (value) {
  return isObject(value) ? value : handleNonObject(value)
}

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const handleNonObject = function (value) {
  try {
    const message = String(value)
    return { message }
  } catch (error) {
    return normalizeException(error)
  }
}

// Convert a plain object to an error instance.
// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const objectToError = function (object, types) {
  const error = createError(object, types)
  setCoreProps(error, object, types)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, getNonCoreProps(object))
  return error
}

// Custom error types might throw due to missing parameters in the constructor.
// When this happens, we silently revert to `Error`.
const createError = function (object, types) {
  const ErrorType = getErrorType(object, types)
  const message = getMessage(object)

  try {
    return new ErrorType(message)
  } catch {
    return new Error(message)
  }
}

// Custom error types can be passed to the `types` option.
// The option is an object instead of an array, as this allows dissociating
// error names from their types, since:
//  - The parsing logic might have different sets of error instances than the
//    serializing logic
//  - This is more consistent with `modern-errors` which discourages
//    exporting types
const getErrorType = function (object, types) {
  const name = safeGetProp(object, 'name')

  if (typeof name !== 'string') {
    return Error
  }

  if (typeof types[name] === 'function') {
    return types[name]
  }

  return BUILTIN_TYPES.has(name) ? globalThis[name] : Error
}

// Common global error types
const BUILTIN_TYPES = new Set([
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

const getMessage = function (object) {
  const message = safeGetProp(object, 'message')
  return typeof message === 'string' ? message : ''
}

const setCoreProps = function (error, object, types) {
  Object.keys(CORE_PROPS).forEach((propName) => {
    setCoreProp({ error, object, propName, types })
  })
}

const setCoreProp = function ({ error, object, propName, types }) {
  const value = safeGetProp(object, propName)

  if (value === undefined) {
    return
  }

  const valueA = recurseCorePropToError(value, propName, types)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value: valueA,
    enumerable: false,
    writable: true,
    configurable: true,
  })
}

// Ensure retrieving a property does not throw due to a getter or proxy
const safeGetProp = function (object, propName) {
  try {
    return object[propName]
  } catch {}
}

// Convert `object.cause|errors` to errors recursively.
// `normalize-exception` will normalize those recursively.
const recurseCorePropToError = function (value, propName, types) {
  if (propName === 'cause') {
    return objectToError(value, types)
  }

  if (propName === 'errors') {
    return value.map((item) => objectToError(item, types))
  }

  return value
}

const CORE_PROPS = ['name', 'message', 'stack', 'cause', 'errors']
const CORE_PROPS_SET = new Set(CORE_PROPS)
/* eslint-enable max-lines */
