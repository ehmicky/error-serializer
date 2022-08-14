import { runInNewContext } from 'vm'

import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

each(
  // eslint-disable-next-line unicorn/no-null, no-magic-numbers
  [undefined, null, 0n, 'message', {}, [], () => {}],
  ({ title }, value) => {
    test(`Allow any type to be serialized | ${title}`, (t) => {
      t.is(typeof serialize(value).message, 'string')
    })

    test(`Allow any type to be parsed | ${title}`, (t) => {
      t.true(parse(value) instanceof Error)
    })

    test(`Non-errors are not serialized with "loose" option | ${title}`, (t) => {
      t.is(serialize(value, { loose: true }), value)
    })

    test(`Non-error objects are not parsed with "loose" option | ${title}`, (t) => {
      t.is(parse(value, { loose: true }), value)
    })
  },
)

test('Allow strings to parsed', (t) => {
  const message = 'test'
  t.is(parse(message).message, message)
})

each([true, false, undefined], ({ title }, loose) => {
  test(`Parsing error is a noop | ${title}`, (t) => {
    const error = new Error('test')
    t.is(parse(error, { loose }), error)
  })

  test(`Parsing cross-realm error is a noop | ${title}`, (t) => {
    const error = runInNewContext('new Error("test")')
    t.is(parse(error, { loose }), error)
  })

  test(`Serializing error object is a noop | ${title}`, (t) => {
    const object = { name: 'Error', message: '' }
    t.is(serialize(object, { loose }), object)
  })
})

test('Normalize invalid stack', (t) => {
  t.is(typeof parse({ stack: 0 }).stack, 'string')
})

test('Normalize invalid cause', (t) => {
  t.true(parse({ cause: 0 }).cause instanceof Error)
})

test('Normalize invalid aggregate errors', (t) => {
  t.true(parse({ errors: [0] }).errors[0] instanceof Error)
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
