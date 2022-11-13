// Call `opts.onError(error)`
// Exceptions are ignored to guarantee error handling safety.
export const callOnError = function (error, onError) {
  if (onError === undefined) {
    return
  }

  try {
    onError(error)
  } catch {}
}
