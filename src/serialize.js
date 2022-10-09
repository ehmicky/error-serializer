import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { listProps } from './props.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function (value, parents) {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, parentsA)
  }

  const valueA = serializeError(value)
  const valueB = serializeRecurse(valueA, parentsA)
  return safeJsonValue(valueB, { shallow: false }).value
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function (value) {
  if (!isErrorInstance(value)) {
    return value
  }

  const valueA = serializeError(value)
  return safeJsonValue(valueA, { shallow: true }).value
}

const serializeError = function (value) {
  const error = normalizeException(value)
  return Object.fromEntries([...getProps(error), ...setConstructorArgs(error)])
}

const getProps = function (error) {
  return listProps(error)
    .map((propName) => [propName, error[propName]])
    .filter(hasValue)
}

const hasValue = function ([, value]) {
  return value !== undefined
}

const serializeRecurse = function (value, parents) {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) => serializeDeep(child, parents))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [propName, serializeDeep(value[propName], parents)]),
    )
  }

  return value
}
