import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorObject, safeListKeys } from '../check.js'
import { listProps, SET_CORE_PROPS, NON_ENUMERABLE_PROPS } from '../core.js'

import { createError } from './create.js'

// Parse error plain objects into error instances deeply
export const parseDeep = function (value, classes) {
  const valueA = parseRecurse(value, classes)
  return parseShallow(valueA, classes)
}

// Parse a possible error plain object into an error instance
export const parseShallow = function (value, classes) {
  if (!isErrorObject(value)) {
    return value
  }

  const valueA = parseErrorObject(value, classes)
  return normalizeException(valueA)
}

// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const parseErrorObject = function (object, classes) {
  const error = createError(object, classes)
  setProps(error, object)
  return error
}

const setProps = function (error, object) {
  listProps(object).forEach((propName) => {
    setProp(error, object, propName)
  })
}

const setProp = function (error, object, propName) {
  if (SET_CORE_PROPS.has(propName)) {
    return
  }

  const value = object[propName]

  if (value === undefined) {
    return
  }

  const enumerable = !NON_ENUMERABLE_PROPS.has(propName)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value,
    enumerable,
    writable: true,
    configurable: true,
  })
}

const parseRecurse = function (value, classes) {
  if (Array.isArray(value)) {
    return value.map((child) => parseDeep(child, classes))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value).map((propName) => [
        propName,
        parseDeep(value[propName], classes),
      ]),
    )
  }

  return value
}
