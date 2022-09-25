import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { isErrorInstance, isErrorObject } from './check.js'
import { parseError } from './parse/main.js'
import { serializeError } from './serialize.js'

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the classes are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = function (value, { normalize = false } = {}) {
  if (!normalize && !isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  const object = serializeError(error)
  const { value: objectA } = safeJsonValue(object)
  return objectA
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (
  value,
  { normalize = false, classes = {} } = {},
) {
  if (!normalize && !isErrorObject(value)) {
    return value
  }

  const error = parseError(value, classes)
  const errorA = normalizeException(error)
  return errorA
}
