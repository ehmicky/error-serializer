import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'

import { isErrorInstance } from './check.js'
import { CORE_PROPS, getNonCoreProps } from './core.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function (value, parents) {
  const parentsA = [...parents, value]
  const valueA = serializeShallow(value)
  return serializeRecurse(valueA, parentsA)
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function (value) {
  if (!isErrorInstance(value)) {
    return value
  }

  const valueA = normalizeException(value)
  return Object.fromEntries([
    ...getCoreProps(valueA),
    ...getNonCoreProps(valueA),
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
      Object.entries(value)
        .filter(([, child]) => !parents.includes(child))
        .map(([propName, child]) => [propName, serializeDeep(child, parents)]),
    )
  }

  return value
}
