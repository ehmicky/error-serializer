import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

test('Default to Error type if no name', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: undefined }).name, 'Error')
})

test('Re-use builtin error types', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: 'TypeError' }).name, 'TypeError')
})

test('Can re-use aggregate error types', (t) => {
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

test('Does not re-use other error types by default', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: 'CustomError' }).name, 'Error')
})

test('Handle non-string error.name', (t) => {
  // eslint-disable-next-line unicorn/no-null
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: null }).name, 'Error')
})

test('Re-uses other error types if specified', (t) => {
  const types = { CustomError: TypeError }
  t.is(
    parse({ ...SIMPLE_ERROR_OBJECT, name: 'CustomError' }, { types }).name,
    types.CustomError.name,
  )
})

test('Can map builtin types', (t) => {
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

each([undefined, true], ({ title }, message) => {
  test(`Handle non-string messages | ${title}`, (t) => {
    t.is(parse({ ...SIMPLE_ERROR_OBJECT, message }).message, '{}')
  })
})

test('Handle unsafe message.toString()', (t) => {
  t.is(
    parse({
      ...SIMPLE_ERROR_OBJECT,
      message: {
        toString() {
          throw new Error('unsafe')
        },
      },
    }).message,
    '{}',
  )
})
