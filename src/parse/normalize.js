import normalizeException from 'normalize-exception'

// We allow invalid `object`, silently normalizing it
//  - This prevents throwing exceptions which would be a problem if used inside
//    some error handling logic
// `normalize-exception` also normalizes those afterwards.
export const normalizeObject = function (value) {
  return isObject(value) ? value : handleNonObject(value)
}

const isObject = function (value) {
  return typeof value === 'object' && value !== null
}

const handleNonObject = function (value) {
  try {
    const message = String(value)
    return { message }
  } catch (error) {
    return normalizeException(error)
  }
}
