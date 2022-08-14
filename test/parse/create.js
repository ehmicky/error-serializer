import test from 'ava'
import { parse } from 'error-serializer'

test('Default to Error type', (t) => {
  t.is(parse().name, 'Error')
})

test('Re-use builtin error types', (t) => {
  t.is(parse({ name: 'TypeError' }).name, 'TypeError')
})

test('Does not re-use other error types by default', (t) => {
  t.is(parse({ name: 'CustomError' }).name, 'Error')
})
