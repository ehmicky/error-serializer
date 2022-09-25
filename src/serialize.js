import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { isErrorInstance, safeListKeys } from './check.js'
import { CORE_PROPS, getNonCoreProps } from './core.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function (value, parents) {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, parentsA)
  }

  const valueA = serializeError(value)
  const valueB = serializeRecurse(valueA, parentsA)
  return safeJsonValue(valueB).value
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function (value) {
  if (!isErrorInstance(value)) {
    return value
  }

  const valueA = serializeError(value)
  return safeJsonValue(valueA).value
}

const serializeError = function (value) {
  const valueA = normalizeException(value)
  return Object.fromEntries([
    ...getCoreProps(valueA),
    ...getNonCoreProps(valueA),
    ...setConstructorArgs(valueA),
  ])
}

const getCoreProps = function (error) {
  return CORE_PROPS.map((propName) => [propName, error[propName]]).filter(
    hasValue,
  )
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
