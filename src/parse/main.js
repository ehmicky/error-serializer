import { UNSET_CORE_PROPS, getNonCoreProps } from '../core.js'
import { safeGetProp } from '../safe.js'

import { createError } from './create.js'

// Convert a plain object to an error instance.
// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
export const parseError = function (object, types) {
  if (Object.prototype.toString.call(object) === '[object Error]') {
    return object
  }

  const error = createError(object, types)
  setCoreProps(error, object, types)
  const nonCoreProps = Object.fromEntries(getNonCoreProps(object))
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, nonCoreProps)
  return error
}

const setCoreProps = function (error, object, types) {
  UNSET_CORE_PROPS.forEach((propName) => {
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

// Convert `object.cause|errors` to errors recursively.
// `normalize-exception` will normalize those recursively.
const recurseCorePropToError = function (value, propName, types) {
  if (propName === 'cause') {
    return parseError(value, types)
  }

  if (propName === 'errors') {
    return value.map((item) => parseError(item, types))
  }

  return value
}
