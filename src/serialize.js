import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { applyList } from './list.js'
import { listProps } from './props.js'
import { applyTransformObject } from './transform.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = (value, options, parents) => {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, options, parentsA)
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error)
  const errorObjectA = serializeRecurse(errorObject, options, parentsA)
  applyTransformObject(errorObjectA, error, options)
  const errorObjectB = applyList(errorObjectA, options)
  const errorObjectC = safeJsonValue(errorObjectB, { shallow: false }).value
  return errorObjectC
}

// Serialize a possible error instance into a plain object
export const serializeShallow = (value, options) => {
  if (!isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error)
  applyTransformObject(errorObject, error, options)
  const errorObjectA = applyList(errorObject, options)
  const errorObjectB = safeJsonValue(errorObjectA, { shallow: true }).value
  return errorObjectB
}

const serializeError = (error) =>
  Object.fromEntries([...getProps(error), ...setConstructorArgs(error)])

const getProps = (error) =>
  listProps(error).map((propName) => [propName, error[propName]])

const serializeRecurse = (value, options, parents) => {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) => serializeDeep(child, options, parents))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [
          propName,
          serializeDeep(value[propName], options, parents),
        ]),
    )
  }

  return value
}
