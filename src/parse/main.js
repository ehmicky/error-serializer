import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorObject, safeGetProp } from '../check.js'
import { UNSET_CORE_PROPS, getNonCoreProps } from '../core.js'

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
  setCoreProps(error, object)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, Object.fromEntries(getNonCoreProps(object)))
  return error
}

const setCoreProps = function (error, object) {
  UNSET_CORE_PROPS.forEach((propName) => {
    setCoreProp(error, object, propName)
  })
}

const setCoreProp = function (error, object, propName) {
  const { safe, value } = safeGetProp(object, propName)

  if (!safe || value === undefined) {
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

const parseRecurse = function (value, classes) {
  if (Array.isArray(value)) {
    return value.map((child) => parseDeep(child, classes))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([propName, child]) => [
        propName,
        parseDeep(child, classes),
      ]),
    )
  }

  return value
}
