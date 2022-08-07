import { safeGetProp } from './safe.js'

// Retrieve properties of an error instance or objects that are not core
// error properties
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
  const value = safeGetProp(errorOrObject, propName)
  return value === undefined ? undefined : [propName, value]
}

// Error core properties
export const CORE_PROPS = ['name', 'message', 'stack', 'cause', 'errors']
export const CORE_PROPS_SET = new Set(CORE_PROPS)
