// Call `opts.before|afterSerialize|Parse()`
// Exceptions are ignored to guarantee error handling safety.
export const callEvent = function (value, eventCallback) {
  if (eventCallback === undefined) {
    return
  }

  try {
    eventCallback(value)
  } catch {}
}
