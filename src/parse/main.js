import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorObject, safeListKeys } from '../check.js'
import { callEvent } from '../event/main.js'
import { listProps, SET_CORE_PROPS, NON_ENUMERABLE_PROPS } from '../props.js'

import { createError } from './create.js'

// Parse error plain objects into error instances deeply
export const parseDeep = function (value, events, classes) {
  const valueA = parseRecurse(value, events, classes)
  return parseShallow(valueA, events, classes)
}

// Parse a possible error plain object into an error instance
export const parseShallow = function (
  value,
  { beforeParse, afterParse },
  classes,
) {
  if (!isErrorObject(value)) {
    return value
  }

  callEvent(beforeParse, value)
  const error = parseErrorObject(value, classes)
  const errorA = normalizeException(error)
  callEvent(afterParse, value, errorA)
  return errorA
}

// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const parseErrorObject = function (errorObject, classes) {
  const error = createError(errorObject, classes)
  setProps(error, errorObject)
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

const parseRecurse = function (value, events, classes) {
  if (Array.isArray(value)) {
    return value.map((child) => parseDeep(child, events, classes))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value).map((propName) => [
        propName,
        parseDeep(value[propName], events, classes),
      ]),
    )
  }

  return value
}
