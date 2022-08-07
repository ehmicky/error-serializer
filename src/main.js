import normalizeException from 'normalize-exception'

// We apply `normalize-exception` to ensure a strict input
export const serialize = function (error) {
  const errorA = normalizeException(error)
  const object = errorA
  return object
}

// We apply `normalize-exception` to ensure a strict output
export const parse = function (object) {
  const error = object
  const errorA = normalizeException(error)
  return errorA
}
