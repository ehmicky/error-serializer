import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { listProps } from './props.js'
import { applyTransformObject } from './transform.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = (value, transformObject, parents) => {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, transformObject, parentsA)
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error)
  const errorObjectA = serializeRecurse(errorObject, transformObject, parentsA)
  applyTransformObject(transformObject, errorObjectA, error)
  const errorObjectB = safeJsonValue(errorObjectA, { shallow: false }).value
  return errorObjectB
}

// Serialize a possible error instance into a plain object
export const serializeShallow = (value, transformObject) => {
  if (!isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error)
  applyTransformObject(transformObject, errorObject, error)
  const errorObjectA = safeJsonValue(errorObject, { shallow: true }).value
  return errorObjectA
}

const serializeError = (error) =>
  Object.fromEntries([...getProps(error), ...setConstructorArgs(error)])

const getProps = (error) =>
  listProps(error)
    .map((propName) => [propName, error[propName]])
    .filter(hasValue)

const hasValue = ([, value]) => value !== undefined

const serializeRecurse = (value, transformObject, parents) => {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) => serializeDeep(child, transformObject, parents))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [
          propName,
          serializeDeep(value[propName], transformObject, parents),
        ]),
    )
  }

  return value
}
