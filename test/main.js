import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

each(
  // eslint-disable-next-line unicorn/no-null, no-magic-numbers
  [undefined, null, 0n, 'message', { message: 'test' }, [], () => {}],
  ({ title }, value) => {
    test(`Allow any type to be serialized | ${title}`, (t) => {
      t.is(typeof serialize(value).message, 'string')
    })
  },
)

each(
  // eslint-disable-next-line unicorn/no-null, no-magic-numbers
  [undefined, null, 0n, 'message', { message: 'test' }, [], () => {}],
  ({ title }, value) => {
    test(`Allow any type to be parsed | ${title}`, (t) => {
      t.true(parse(value) instanceof Error)
    })
  },
)

test('Allow strings to parsed', (t) => {
  const message = 'test'
  t.is(parse(message).message, message)
})

test('Parsing error is a noop', (t) => {
  const error = new Error('test')
  t.is(parse(error), error)
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
