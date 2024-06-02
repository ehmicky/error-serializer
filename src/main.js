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
  const { loose, shallow, transformObject } = normalizeOptions(options)
  const valueA = applySerializeLoose(value, loose)
  return shallow
    ? serializeShallow(valueA, transformObject)
    : serializeDeep(valueA, transformObject, [])
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
  const { loose, shallow, transformArgs, transformInstance, classes } =
    normalizeOptions(options)
  const valueA = shallow
    ? parseShallow({ value, transformArgs, transformInstance, classes })
    : parseDeep({ value, transformArgs, transformInstance, classes })
  return applyParseLoose(valueA, loose, transformInstance)
}

const applyParseLoose = (value, loose, transformInstance) => {
  if (loose || isErrorInstance(value)) {
    return value
  }

  const error = normalizeException(value)
  applyTransformInstance(transformInstance, error, value)
  return error
}
