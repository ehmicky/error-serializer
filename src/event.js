// Call `opts.before|afterSerialize|Parse()`
// Exceptions are ignored to guarantee error handling safety.
export const callEvent = function (eventCallback, ...args) {
  if (eventCallback === undefined) {
    return
  }

  try {
    eventCallback(...args)
  } catch {}
}
