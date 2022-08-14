// Simple error plain object to test with
export const SIMPLE_ERROR_OBJECT = { name: 'Error', message: '', stack: '' }

// Error with `cause` and `errors` set
export const FULL_ERROR = new Error('test')
// eslint-disable-next-line fp/no-mutation
FULL_ERROR.cause = new Error('inner')
// eslint-disable-next-line fp/no-mutation
FULL_ERROR.errors = [new Error('otherInner')]
