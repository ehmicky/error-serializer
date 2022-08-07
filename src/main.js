import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

// We apply `normalize-exception` to ensure a strict input
export const serialize = function (error) {
  const errorA = normalizeException(error)
  const object = errorToObject(errorA)
  const objectA = safeJsonValue(object)
  return objectA
}

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
  const nonCoreProps = Object.entries(error).filter(isNonCoreProp)
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
  return value === undefined ? undefined : [propName, value]
}

const isNonCoreProp = function ([propName]) {
  return !CORE_PROPS_SET.has(propName) && !IGNORED_PROPS.has(propName)
}

const CORE_PROPS = ['name', 'message', 'stack', 'cause', 'errors']
const CORE_PROPS_SET = new Set(CORE_PROPS)
// We ignore `error.toJSON()` to ensure the plain object can be parsed back
const IGNORED_PROPS = new Set(['toJSON'])

// We apply `normalize-exception` to ensure a strict output
export const parse = function (object) {
  const error = object
  const errorA = normalizeException(error)
  return errorA
}
