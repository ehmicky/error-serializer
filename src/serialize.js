import isErrorInstance from 'is-error-instance'
import isPlainObj from 'is-plain-obj'
import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { setConstructorArgs } from './args.js'
import { safeListKeys } from './check.js'
import { callEvent } from './event.js'
import { listProps } from './props.js'

// Serialize error instances into plain objects deeply
export const serializeDeep = function ({
  value,
  beforeSerialize,
  afterSerialize,
  parents,
}) {
  const parentsA = [...parents, value]

  if (!isErrorInstance(value)) {
    return serializeRecurse({
      value,
      beforeSerialize,
      afterSerialize,
      parents: parentsA,
    })
  }

  const errorObject = serializeError(value, beforeSerialize, afterSerialize)
  const valueA = serializeRecurse({
    value: errorObject,
    beforeSerialize,
    afterSerialize,
    parents: parentsA,
  })
  return safeJsonValue(valueA, { shallow: false }).value
}

// Serialize a possible error instance into a plain object
export const serializeShallow = function ({
  value,
  beforeSerialize,
  afterSerialize,
}) {
  if (!isErrorInstance(value)) {
    return value
  }

  const errorObject = serializeError(value, beforeSerialize, afterSerialize)
  return safeJsonValue(errorObject, { shallow: true }).value
}

const serializeError = function (error, beforeSerialize, afterSerialize) {
  const errorA = normalizeException(error)
  callEvent(errorA, beforeSerialize)
  const errorObject = Object.fromEntries([
    ...getProps(errorA),
    ...setConstructorArgs(errorA),
  ])
  callEvent(errorA, afterSerialize)
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

const serializeRecurse = function ({
  value,
  beforeSerialize,
  afterSerialize,
  parents,
}) {
  if (Array.isArray(value)) {
    return value
      .filter((child) => !parents.includes(child))
      .map((child) =>
        serializeDeep({
          value: child,
          beforeSerialize,
          afterSerialize,
          parents,
        }),
      )
  }

  if (isPlainObj(value)) {
    return Object.fromEntries(
      safeListKeys(value)
        .filter((propName) => !parents.includes(value[propName]))
        .map((propName) => [
          propName,
          serializeDeep({
            value: value[propName],
            beforeSerialize,
            afterSerialize,
            parents,
          }),
        ]),
    )
  }

  return value
}
