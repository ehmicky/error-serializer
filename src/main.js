import isErrorInstance from 'is-error-instance'
import normalizeException from 'normalize-exception'

import { normalizeOptions, validateOptions } from './options.js'
import { parseDeep, parseShallow } from './parse/main.js'
import { serializeDeep, serializeShallow } from './serialize.js'

export { validateOptions }

// Normalize and convert an error instance into a plain object, ready to be
// serialized.
// The logic is JSON-focused.
//  - This fits most serialization formats, while still being opinionated
//    enough to provide features like ensuring the classes are correct
// We apply `normalize-exception` to ensure a strict input.
//  - We allow arguments that are not `error` instances
export const serialize = function (value, options) {
  const { loose, shallow, beforeSerialize, afterSerialize } =
    normalizeOptions(options)
  const valueA = applyLoose(value, loose)
  const events = { beforeSerialize, afterSerialize }
  return shallow
    ? serializeShallow(valueA, events)
    : serializeDeep(valueA, events, [])
}

// Normalize and convert an already parsed plain object representing an error
// into an error instance.
// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// We apply `normalize-exception` to ensure a strict output.
export const parse = function (value, options) {
  const { loose, shallow, beforeParse, afterParse, classes } =
    normalizeOptions(options)
  const events = { beforeParse, afterParse }
  const valueA = shallow
    ? parseShallow(value, events, classes)
    : parseDeep(value, events, classes)
  return applyLoose(valueA, loose)
}

const applyLoose = function (value, loose) {
  return loose || isErrorInstance(value) ? value : normalizeException(value)
}
