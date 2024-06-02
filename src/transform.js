// Call `opts.transformObject()` with `serialize()`
// Exceptions are ignored to guarantee error handling safety.
// Users must directly mutate the object. This is faster, avoids cycles and
// ensures the result is a proper error object/instance.
export const applyTransformObject = (transformObject, errorObject, error) => {
  try {
    transformObject?.(errorObject, error)
  } catch {}
}

// Call `opts.transformInstance()` with `parse()`
export const applyTransformInstance = (
  transformInstance,
  error,
  errorObject,
) => {
  try {
    transformInstance?.(error, errorObject)
  } catch {}
}
