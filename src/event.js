// Call `opts.beforeSerialize|afterParse(error)`
// Exceptions are ignored to guarantee error handling safety.
export const callEvent = function (error, eventCallback) {
  if (eventCallback === undefined) {
    return
  }

  try {
    eventCallback(error)
  } catch {}
}
