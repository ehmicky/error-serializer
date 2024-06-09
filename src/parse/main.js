import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorObject, safeListKeys } from '../check.js'
import { listProps, SET_CORE_PROPS, NON_ENUMERABLE_PROPS } from '../props.js'
import { applyTransformInstance } from '../transform.js'

import { createError } from './create.js'

// Parse error plain objects into error instances deeply
export const parseDeep = (value, options) => {
  const valueA = parseRecurse(value, options)
  return parseShallow(valueA, options)
}

// Parse a possible error plain object into an error instance
export const parseShallow = (value, options) => {
  if (!isErrorObject(value)) {
    return value
  }

  const error = parseErrorObject(value, options)
  const errorA = normalizeException(error)
  applyTransformInstance(errorA, value, options)
  return errorA
}

// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const parseErrorObject = (errorObject, options) => {
  const error = createError({ errorObject, options })
  setProps(error, errorObject)
  return error
}

const setProps = (error, object) => {
  listProps(object)
    .filter(isNotCoreProp)
    .forEach((propName) => {
      setProp(error, object, propName)
    })
}

const isNotCoreProp = (propName) => !SET_CORE_PROPS.has(propName)

const setProp = (error, object, propName) => {
  const enumerable = !NON_ENUMERABLE_PROPS.has(propName)
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, propName, {
    value: object[propName],
    enumerable,
    writable: true,
    configurable: true,
  })
}

const parseRecurse = (value, options) => {
  if (Array.isArray(value)) {
    return value.map((child) => parseDeep(child, options))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value).map((propName) => [
        propName,
        parseDeep(value[propName], options),
      ]),
    )
  }

  return value
}
