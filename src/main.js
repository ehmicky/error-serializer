import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { isErrorInstance, isErrorObject } from './check.js'
import { parseError } from './parse/main.js'
import { serializeError } from './serialize.js'

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the types are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = function (error, { loose = false } = {}) {
  if (shouldSkipSerialize(error, loose)) {
    return error
  }

  const errorA = normalizeException(error)
  const object = serializeError(errorA)
  const { value } = safeJsonValue(object)
  return value
}

const shouldSkipSerialize = function (error, loose) {
  return (loose && !isErrorInstance(error)) || isErrorObject(error, true)
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (value, { loose = false, types = {} } = {}) {
  const isObject = isErrorObject(value, false)

  if (shouldSkipParse(value, loose, isObject)) {
    return value
  }

  const error = isObject ? parseError(value, types) : value
  const errorA = normalizeException(error)
  return errorA
}

const shouldSkipParse = function (value, loose, isObject) {
  return (loose && !isObject) || isErrorInstance(value)
}
