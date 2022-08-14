import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

import { parseError } from './parse/main.js'
import { normalizeObject } from './parse/normalize.js'
import { serializeError } from './serialize.js'

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the types are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = function (error) {
  const errorA = normalizeException(error)
  const object = serializeError(errorA)
  const { value } = safeJsonValue(object)
  return value
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (value, { types = {} } = {}) {
  const object = normalizeObject(value)
  const error = parseError(object, types)
  const errorA = normalizeException(error)
  return errorA
}
