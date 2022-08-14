import isPlainObj from 'is-plain-obj'

// Check if a value is an Error instance
export const isErrorInstance = function (value) {
  return Object.prototype.toString.call(value) === '[object Error]'
}

// Check if a value conforms to the error plain object shape.
// This enforces strict outputs.
export const isErrorObject = function (value, deep) {
  return (
    isPlainObj(value) &&
    hasCoreProps(value) &&
    isOptionalErrorObject(value, 'cause', deep) &&
    isOptionalErrorsArray(value, 'errors', deep)
  )
}

const hasCoreProps = function (value) {
  return (
    isStringProp(value, 'name') &&
    isStringProp(value, 'message') &&
    isStringProp(value, 'stack')
  )
}

const isStringProp = function (object, propName) {
  const { safe, value } = safeGetProp(object, propName)
  return safe && typeof value === 'string'
}

const isOptionalErrorObject = function (object, propName, deep) {
  const { safe, value } = safeGetProp(object, propName)
  return safe && (value === undefined || isErrorObjectOrInstance(value, deep))
}

const isOptionalErrorsArray = function (object, propName, deep) {
  const { safe, value } = safeGetProp(object, propName)
  return (
    safe &&
    (value === undefined ||
      (Array.isArray(value) &&
        value.every((item) => isErrorObjectOrInstance(item, deep))))
  )
}

// `JSON.parse()`'s reviver parses children before parents, so they might
// be error instances
const isErrorObjectOrInstance = function (value, deep) {
  return (!deep && isErrorInstance(value)) || isErrorObject(value, deep)
}

// Ensure retrieving a property does not throw due to a getter or proxy
export const safeGetProp = function (object, propName) {
  try {
    const value = object[propName]
    return { safe: true, value }
  } catch {
    return { safe: false }
  }
}
