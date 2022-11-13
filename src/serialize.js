import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { callEvent } from './event.js'
import { listProps } from './props.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function (value, events, parents) {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, events, parentsA)
  }

  const errorObject = serializeError(value, events)
  const valueA = serializeRecurse(errorObject, events, parentsA)
  return safeJsonValue(valueA, { shallow: false }).value
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function (value, events) {
  if (!isErrorInstance(value)) {
    return value
  }

  const errorObject = serializeError(value, events)
  return safeJsonValue(errorObject, { shallow: true }).value
}

const serializeError = function (error, { beforeSerialize, afterSerialize }) {
  const errorA = normalizeException(error)
  callEvent(beforeSerialize, errorA)
  const errorObject = Object.fromEntries([
    ...getProps(errorA),
    ...setConstructorArgs(errorA),
  ])
  callEvent(afterSerialize, errorA, errorObject)
  return errorObject
}

const getProps = function (error) {
  return listProps(error)
    .map((propName) => [propName, error[propName]])
    .filter(hasValue)
}

const hasValue = function ([, value]) {
  return value !== undefined
}

const serializeRecurse = function (value, events, parents) {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) => serializeDeep(child, events, parents))
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [
          propName,
          serializeDeep(value[propName], events, parents),
        ]),
    )
  }

  return value
}
