import isErrorInstance from 'is-error-instance'
import normalizeException from 'normalize-exception'

import { parseDeep, parseShallow } from './parse/main.js'
import { serializeDeep, serializeShallow } from './serialize.js'

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the classes are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = function (
  value,
  { normalize = false, shallow = false, beforeSerialize } = {},
) {
  const valueA = applyNormalize(value, normalize)
  return shallow
    ? serializeShallow(valueA, beforeSerialize)
    : serializeDeep(valueA, beforeSerialize, [])
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (
  value,
  { normalize = false, shallow = false, afterParse, classes = {} } = {},
) {
  const valueA = shallow
    ? parseShallow(value, afterParse, classes)
    : parseDeep(value, afterParse, classes)
  return applyNormalize(valueA, normalize)
}

const applyNormalize = function (value, normalize) {
  return normalize && !isErrorInstance(value)
    ? normalizeException(value)
    : value
}
