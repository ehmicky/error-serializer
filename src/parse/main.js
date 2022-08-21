import { isErrorObject, safeGetProp } from '../check.js'
import { UNSET_CORE_PROPS, getNonCoreProps } from '../core.js'

import { createError } from './create.js'

// Convert a plain object to an error instance.
// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
// If the value is not a valid plain object, we let `normalize-exception`
// handle it.
//  - We do this recursively, especially since `JSON.parse()`'s reviver parses
//    children before parents, so they might be error instances
export const parseError = function (object, classes) {
  if (!isErrorObject(object)) {
    return object
  }

  const error = createError(object, classes)
  setCoreProps(error, object, classes)
  const nonCoreProps = Object.fromEntries(getNonCoreProps(object))
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, nonCoreProps)
  return error
}

const setCoreProps = function (error, object, classes) {
  UNSET_CORE_PROPS.forEach((propName) => {
    setCoreProp({ error, object, propName, classes })
  })
}

const setCoreProp = function ({ error, object, propName, classes }) {
  const { safe, value } = safeGetProp(object, propName)

  if (!safe || value === undefined) {
    return
  }

  const valueA = recurseCorePropToError(value, propName, classes)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value: valueA,
    enumerable: false,
    writable: true,
    configurable: true,
  })
}

// Convert `object.cause|errors` to errors recursively.
// `normalize-exception` will normalize those recursively.
const recurseCorePropToError = function (value, propName, classes) {
  if (propName === 'cause') {
    return parseError(value, classes)
  }

  if (propName === 'errors' && Array.isArray(value)) {
    return value.map((item) => parseError(item, classes))
  }

  return value
}
