import isPlainObj from 'is-plain-obj'

// Check if a value conforms to the error plain object shape.
// This enforces strict outputs.
export const isErrorObject = (value) =>
  isPlainObj(value) && isStringProp(value, 'message')

const isStringProp = (object, propName) =>
  isSafeProp(object, propName) && typeof object[propName] === 'string'

export const safeListKeys = (value) => listSafeKeys(value, Object.keys(value))

export const listSafeKeys = (value, keys) =>
  keys.filter((propName) => isSafeProp(value, propName))

// Ensure retrieving a property does not throw due to a getter or proxy
const isSafeProp = (object, propName) => {
  try {
    // eslint-disable-next-line no-unused-expressions
    object[propName]
    return true
  } catch {
    return false
  }
}
