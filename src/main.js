import normalizeException from 'normalize-exception'
import safeJsonValue from 'safe-json-value'

// We apply `normalize-exception` to ensure a strict input
export const serialize = function (error) {
  const errorA = normalizeException(error)
  const object = errorA
  const objectA = safeJsonValue(object)
  return objectA
}

// We apply `normalize-exception` to ensure a strict output
export const parse = function (object) {
  const error = object
  const errorA = normalizeException(error)
  return errorA
}
