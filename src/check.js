import isPlainObj from 'is-plain-obj'

import { safeGetProp } from './safe.js'

// Check if a value is an Error instance
export const isErrorInstance = function (value) {
  return Object.prototype.toString.call(value) === '[object Error]'
}

// Check if a value conforms to the error plain object shape.
// This enforces strict outputs.
export const isErrorObject = function (value) {
  return (
    isPlainObj(value) &&
    hasCoreProps(value) &&
    isOptionalErrorObject(value, 'cause') &&
    isOptionalErrorsArray(value, 'errors')
  )
}

const hasCoreProps = function (value) {
  return (
    isStringProp(value, 'name') &&
    isStringProp(value, 'message') &&
    isStringProp(value, 'stack')
  )
}

const isStringProp = function (object, propName) {
  const value = safeGetProp(object, propName)
  return typeof value === 'string'
}

const isOptionalErrorObject = function (object, propName) {
  const value = safeGetProp(object, propName)
  return value === undefined || isErrorObject(value)
}

const isOptionalErrorsArray = function (object, propName) {
  const value = safeGetProp(object, propName)
  return (
    value === undefined || (Array.isArray(value) && value.every(isErrorObject))
  )
}
