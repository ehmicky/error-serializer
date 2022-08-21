import test from 'ava'
import { parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

test('Default to Error class if no name', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: undefined }).name, 'Error')
})

test('Re-use builtin error classes', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: 'TypeError' }).name, 'TypeError')
})

test('Can re-use aggregate error classes', (t) => {
  const object = {
    ...SIMPLE_ERROR_OBJECT,
    name: 'AggregateError',
    errors: [{ ...SIMPLE_ERROR_OBJECT, message: 'inner' }],
  }
  const {
    name,
    message,
    errors: [{ message: innerMessage }],
  } = parse(object)
  t.is(name, 'AggregateError' in globalThis ? object.name : 'Error')
  t.is(message, object.message)
  t.is(innerMessage, object.errors[0].message)
})

test('Does not re-use other error classes by default', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: 'CustomError' }).name, 'Error')
})

test('Re-uses other error classes if specified', (t) => {
  const types = { CustomError: TypeError }
  t.is(
    parse({ ...SIMPLE_ERROR_OBJECT, name: 'CustomError' }, { types }).name,
    types.CustomError.name,
  )
})

test('Can map builtin classes', (t) => {
  const types = { Error: TypeError }
  t.is(
    parse({ ...SIMPLE_ERROR_OBJECT, name: 'Error' }, { types }).name,
    types.Error.name,
  )
})

test('Handle unsafe constructors', (t) => {
  // eslint-disable-next-line fp/no-class
  class CustomError extends Error {
    constructor() {
      throw new Error('unsafe')
    }
  }
  t.is(
    parse(
      { ...SIMPLE_ERROR_OBJECT, name: 'CustomError' },
      { types: { CustomError } },
    ).name,
    'Error',
  )
})
