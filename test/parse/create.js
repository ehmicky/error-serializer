import test from 'ava'
import { parse } from 'error-serializer'

test('Default to Error type', (t) => {
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
