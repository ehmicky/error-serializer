// Custom error classes might throw due to missing parameters in the
// constructor. When this happens, we silently revert to `Error`.
export const createError = function ({ name, message }, classes) {
  const ErrorClass = getErrorClass(name, classes)

  try {
    return ErrorClass === globalThis.AggregateError
      ? new ErrorClass([], message)
      : new ErrorClass(message)
  } catch {
    return new Error(message)
  }
}

// Custom error classes can be passed to the `classes` option.
// The option is an object instead of an array, as this allows dissociating
// error names from their classes, since:
//  - The parsing logic might have different sets of error instances than the
//    serializing logic
//  - This is more consistent with `modern-errors` which discourages
//    exporting classes
const getErrorClass = function (name, classes) {
  if (typeof classes[name] === 'function') {
    return classes[name]
  }

  return BUILTIN_CLASSES.has(name) ? globalThis[name] : Error
}

// Common global error classes
const BUILTIN_CLASSES = new Set([
  'Error',
  'ReferenceError',
  'TypeError',
  'SyntaxError',
  'RangeError',
  'URIError',
  'EvalError',

  // This might not exist on some older platforms
  'AggregateError',

  // Browser-only
  'DOMException',
])
