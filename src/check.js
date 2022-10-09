import isPlainObj from 'is-plain-obj'

// Check if a value conforms to the error plain object shape.
// This enforces strict outputs.
export const isErrorObject = function (value) {
  return (
    isPlainObj(value) &&
    isStringProp(value, 'name') &&
    isStringProp(value, 'message') &&
    isStringProp(value, 'stack')
  )
}

const isStringProp = function (object, propName) {
  return isSafeProp(object, propName) && typeof object[propName] === 'string'
}

export const safeListKeys = function (value) {
  return listSafeKeys(value, Object.keys(value))
}

export const listSafeKeys = function (value, keys) {
  return keys.filter((propName) => isSafeProp(value, propName))
}

// Ensure retrieving a property does not throw due to a getter or proxy
const isSafeProp = function (object, propName) {
  try {
    // eslint-disable-next-line no-unused-expressions
    object[propName]
    return true
  } catch {
    return false
  }
}
