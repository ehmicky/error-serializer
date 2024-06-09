// Call `opts.transformObject()` with `serialize()`
// Exceptions are ignored to guarantee error handling safety.
// Users must directly mutate the object. This is faster, avoids cycles and
// ensures the result is a proper error object/instance.
export const applyTransformObject = (
  errorObject,
  error,
  { transformObject },
) => {
  try {
    transformObject?.(errorObject, error)
  } catch {}
}

// Call `opts.transformInstance()` with `parse()`
export const applyTransformInstance = (
  error,
  errorObject,
  { transformInstance },
) => {
  try {
    transformInstance?.(error, errorObject)
  } catch {}
}
