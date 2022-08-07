// Ensure retrieving a property does not throw due to a getter or proxy
export const safeGetProp = function (object, propName) {
  try {
    return object[propName]
  } catch {}
}
