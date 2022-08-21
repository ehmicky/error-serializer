import { safeGetProp } from './check.js'

// Retrieve properties of an error instance or objects that are not core
// error properties.
// When serializing, we exclude non-core error properties that either:
//  - Are non-enumerable
//     - Reason: most likely not meant to be serialized
//  - Are inherited
//     - They cannot be parsed back as inherited
//     - If the same Error class is used during parsing, they are kept anyway
//  - Have symbol keys
//     - Reason: not supported by JSON
// When parsing, we do the same since JSON should only have enumerable, own,
// non-symbol keys.
export const getNonCoreProps = function (errorOrObject) {
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
  const { safe, value } = safeGetProp(errorOrObject, propName)
  return safe && value !== undefined ? [propName, value] : undefined
}

// Error core properties.
// Split between the ones set by error constructors and the ones that need to
// be rest.
//  - This ensure we don't redefine `error.name` so it matches its constructor
const SET_CORE_PROPS = ['name', 'message']
export const UNSET_CORE_PROPS = ['stack', 'cause', 'errors']
export const CORE_PROPS = [...SET_CORE_PROPS, ...UNSET_CORE_PROPS]
export const CORE_PROPS_SET = new Set(CORE_PROPS)
