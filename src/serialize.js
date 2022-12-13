import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { callEvent } from './event.js'
import { listProps } from './props.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = (value, events, parents) => {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse(value, events, parentsA)
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error, events)
  const errorObjectA = serializeRecurse(errorObject, events, parentsA)
  const errorObjectB = safeJsonValue(errorObjectA, { shallow: false }).value
  callEvent(events.afterSerialize, error, errorObjectB)
  return errorObjectB
}

// Serialize a possible error instance into a plain object
export const serializeShallow = (value, events) => {
  if (!isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  const errorObject = serializeError(error, events)
  const errorObjectA = safeJsonValue(errorObject, { shallow: true }).value
  callEvent(events.afterSerialize, error, errorObjectA)
  return errorObjectA
}

const serializeError = (error, { beforeSerialize }) => {
  callEvent(beforeSerialize, error)
  return Object.fromEntries([...getProps(error), ...setConstructorArgs(error)])
}

const getProps = (error) =>
  listProps(error)
    .map((propName) => [propName, error[propName]])
    .filter(hasValue)

const hasValue = ([, value]) => value !== undefined

const serializeRecurse = (value, events, parents) => {
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
