// Custom error types might throw due to missing parameters in the constructor.
// When this happens, we silently revert to `Error`.
export const createError = function ({ name, message }, types) {
  const ErrorType = getErrorType(name, types)

  try {
    return ErrorType === globalThis.AggregateError
      ? new ErrorType([], message)
      : new ErrorType(message)
  } catch {
    return new Error(message)
  }
}

// Custom error types can be passed to the `types` option.
// The option is an object instead of an array, as this allows dissociating
// error names from their types, since:
//  - The parsing logic might have different sets of error instances than the
//    serializing logic
//  - This is more consistent with `modern-errors` which discourages
//    exporting types
const getErrorType = function (name, types) {
  if (typeof types[name] === 'function') {
    return types[name]
  }

  return BUILTIN_TYPES.has(name) ? globalThis[name] : Error
}

// Common global error types
const BUILTIN_TYPES = new Set([
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
