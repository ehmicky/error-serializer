import isErrorInstance from 'is-error-instance'
import normalizeException from 'normalize-exception'

import { normalizeOptions, validateOptions } from './options.js'
import { parseDeep, parseShallow } from './parse/main.js'
import { serializeDeep, serializeShallow } from './serialize.js'
import { applyTransformInstance } from './transform.js'

export { validateOptions }

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the classes are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = (value, options) => {
  const { loose, shallow, ...otherOptions } = normalizeOptions(options)
  const valueA = applySerializeLoose(value, loose)
  return shallow
    ? serializeShallow(valueA, otherOptions)
    : serializeDeep(valueA, otherOptions, [])
}

const applySerializeLoose = (value, loose) =>
  loose || isErrorInstance(value) ? value : normalizeException(value)

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// We apply `normalize-exception` to ensure a strict output.
export const parse = (value, options) => {
  const { loose, shallow, ...otherOptions } = normalizeOptions(options)
  const valueA = shallow
    ? parseShallow(value, otherOptions)
    : parseDeep(value, otherOptions)
  return applyParseLoose(valueA, loose, otherOptions)
}

const applyParseLoose = (value, loose, options) => {
  if (loose || isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  applyTransformInstance(error, value, options)
  return error
}
