import test from 'ava'
import { parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.test.js'


test('Default to Error class if no name', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: undefined }).name, 'Error')
})

test('Re-use builtin error classes', (t) => {
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, name: 'TypeError' }).name, 'TypeError')
})

test('Ignore classes option that are undefined', (t) => {
  t.is(
    parse(
      { ...SIMPLE_ERROR_OBJECT, name: 'TypeError' },
      { classes: { TypeError: undefined } },
    ).name,
    'TypeError',
  )
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
  const CustomError = TypeError
  const error = parse(
    { ...SIMPLE_ERROR_OBJECT, name: 'CustomError' },
    { classes: { CustomError } },
  )
  t.is(error.name, CustomError.name)
  t.is(error.constructor, CustomError)
  t.true(error.stack.includes(CustomError.name))
})

test('Can map builtin classes', (t) => {
  const classes = { Error: TypeError }
  const error = parse({ ...SIMPLE_ERROR_OBJECT, name: 'Error' }, { classes })
  t.is(error.name, classes.Error.name)
})
