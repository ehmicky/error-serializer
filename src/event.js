// Call `opts.before|afterSerialize|Parse()`
// Exceptions are ignored to guarantee error handling safety.
export const callEvent = (eventCallback, ...args) => {
  if (eventCallback === undefined) {
    return
  }

  try {
    eventCallback(...args)
  } catch {}
}
