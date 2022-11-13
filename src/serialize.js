import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { callOnError } from './on_error.js'
import { listProps } from './props.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function (value, onError, parents) {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, onError, parentsA)
  }

  const valueA = serializeError(value, onError)
  const valueB = serializeRecurse(valueA, onError, parentsA)
  return safeJsonValue(valueB, { shallow: false }).value
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function (value, onError) {
  if (!isErrorInstance(value)) {
    return value
  }

  const valueA = serializeError(value, onError)
  return safeJsonValue(valueA, { shallow: true }).value
}

const serializeError = function (error, onError) {
  const errorA = normalizeException(error)
  callOnError(errorA, onError)
  return Object.fromEntries([
    ...getProps(errorA),
    ...setConstructorArgs(errorA),
  ])
}

const getProps = function (error) {
  return listProps(error)
    .map((propName) => [propName, error[propName]])
    .filter(hasValue)
}

const hasValue = function ([, value]) {
  return value !== undefined
}

const serializeRecurse = function (value, onError, parents) {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) => serializeDeep(child, onError, parents))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [
          propName,
          serializeDeep(value[propName], onError, parents),
        ]),
    )
  }

  return value
}
