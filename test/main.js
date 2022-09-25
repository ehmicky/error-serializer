import test from 'ava'
import { serialize, parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.js'

test('Normalize invalid types when parsing with "normalize: true"', (t) => {
  const message = 'test'
  t.is(parse(message, { normalize: true }).message, message)
})

test('Normalize core properties when parsing', (t) => {
  t.is(
    typeof parse({ ...SIMPLE_ERROR_OBJECT, stack: 0 }, { normalize: true })
      .stack,
    'string',
  )
})

test('Remove unsafe non-core properties when serializing', (t) => {
  const error = new Error('test')
  error.prop = 0n
  t.is(serialize(error).prop, undefined)
})

test('Remove circular non-core properties when serializing', (t) => {
  const error = new Error('test')
  error.prop = error
  t.deepEqual(serialize(error).prop, {})
})

test('Make non-core properties JSON-safe when serializing', (t) => {
  const error = new Error('test')
  const date = new Date()
  error.prop = [Number.NaN, undefined, true, date]
  t.deepEqual(serialize(error).prop, [true, date.toJSON()])
})
