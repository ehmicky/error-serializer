import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

test('Default to Error type if no name', (t) => {
  t.is(parse().name, 'Error')
})

test('Re-use builtin error types', (t) => {
  t.is(parse({ name: 'TypeError' }).name, 'TypeError')
})

test('Can re-use aggregate error types', (t) => {
  const object = {
    name: 'AggregateError',
    message: 'test',
    errors: [{ message: 'inner' }],
  }
  const {
    name,
    message,
    errors: [{ message: innerMessage }],
  } = parse(object)
  t.is(name, object.name)
  t.is(message, object.message)
  t.is(innerMessage, object.errors[0].message)
})

test('Does not re-use other error types by default', (t) => {
  t.is(parse({ name: 'CustomError' }).name, 'Error')
})

test('Re-uses other error types if specified', (t) => {
  const types = { CustomError: TypeError }
  t.is(parse({ name: 'CustomError' }, { types }).name, types.CustomError.name)
})

test('Can map builtin types', (t) => {
  const types = { Error: TypeError }
  t.is(parse({ name: 'Error' }, { types }).name, types.Error.name)
})

test('Handle unsafe constructors', (t) => {
  // eslint-disable-next-line fp/no-class
  class CustomError extends Error {
    constructor() {
      throw new Error('unsafe')
    }
  }
  t.is(parse({ name: 'CustomError' }, { types: { CustomError } }).name, 'Error')
})

each([undefined, true], ({ title }, message) => {
  test(`Default to empty message | ${title}`, (t) => {
    t.is(parse({ message }).message, '')
  })
})
