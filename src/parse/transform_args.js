// Apply `transformArgs` option
export const applyTransformArgs = ({
  transformArgs,
  constructorArgs,
  errorObject,
  ErrorClass,
}) => {
  try {
    transformArgs?.(constructorArgs, errorObject, ErrorClass)
  } catch {}
}
