// Simple error plain object to test with
export const SIMPLE_ERROR_OBJECT = { name: 'Error', message: '', stack: '' }

// Error with `cause` and `errors` set
// eslint-disable-next-line fp/no-mutating-methods
export const FULL_ERROR = Object.defineProperties(new Error('test'), {
  cause: {
    value: new Error('inner'),
    enumerable: false,
    writable: true,
    configurable: true,
  },
  errors: [
    {
      value: new Error('otherInner'),
      enumerable: false,
      writable: true,
      configurable: true,
    },
  ],
})
