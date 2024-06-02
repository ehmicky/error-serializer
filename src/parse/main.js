import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorObject, safeListKeys } from '../check.js'
import { listProps, SET_CORE_PROPS, NON_ENUMERABLE_PROPS } from '../props.js'
import { applyTransformInstance } from '../transform.js'

import { createError } from './create.js'

// Parse error plain objects into error instances deeply
export const parseDeep = ({
  value,
  transformArgs,
  transformInstance,
  classes,
}) => {
  const valueA = parseRecurse({
    value,
    transformArgs,
    transformInstance,
    classes,
  })
  return parseShallow({
    value: valueA,
    transformArgs,
    transformInstance,
    classes,
  })
}

// Parse a possible error plain object into an error instance
export const parseShallow = ({
  value,
  transformArgs,
  transformInstance,
  classes,
}) => {
  if (!isErrorObject(value)) {
    return value
  }

  const error = parseErrorObject(value, transformArgs, classes)
  const errorA = normalizeException(error)
  applyTransformInstance(transformInstance, errorA, value)
  return errorA
}

// This is done before `normalize-exception`.
//  - It does not reuse `normalize-exception`'s object parsing logic
//  - reason: keep projects separate since they have different purposes and
//    features
const parseErrorObject = (errorObject, transformArgs, classes) => {
  const error = createError({ errorObject, transformArgs, classes })
  setProps(error, errorObject)
  return error
}

const setProps = (error, object) => {
  listProps(object).forEach((propName) => {
    setProp(error, object, propName)
  })
}

const setProp = (error, object, propName) => {
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

const parseRecurse = ({ value, transformArgs, transformInstance, classes }) => {
  if (Array.isArray(value)) {
    return value.map((child) =>
      parseDeep({ value: child, transformArgs, transformInstance, classes }),
    )
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value).map((propName) => [
        propName,
        parseDeep({
          value: value[propName],
          transformArgs,
          transformInstance,
          classes,
        }),
      ]),
    )
  }

  return value
}
