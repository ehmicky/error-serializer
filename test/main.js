import { runInNewContext } from 'vm'

import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.js'

each(
  [
    undefined,
    // eslint-disable-next-line unicorn/no-null
    null,
    // eslint-disable-next-line no-magic-numbers
    0n,
    'message',
    {},
    ...['name', 'message', 'stack'].flatMap((propName) => [
      { ...SIMPLE_ERROR_OBJECT, [propName]: undefined },
      { ...SIMPLE_ERROR_OBJECT, [propName]: true },
    ]),
    { ...SIMPLE_ERROR_OBJECT, cause: true },
    { ...SIMPLE_ERROR_OBJECT, cause: { name: true } },
    { ...SIMPLE_ERROR_OBJECT, errors: true },
    { ...SIMPLE_ERROR_OBJECT, errors: [undefined] },
    { ...SIMPLE_ERROR_OBJECT, errors: [SIMPLE_ERROR_OBJECT, { name: true }] },
    ...['name', 'message', 'stack', 'cause', 'errors'].flatMap((propName) => ({
      ...SIMPLE_ERROR_OBJECT,
      // eslint-disable-next-line fp/no-get-set
      get [propName]() {
        throw new Error('unsafe')
      },
    })),
    [],
    () => {},
  ],
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
    t.is(serialize(SIMPLE_ERROR_OBJECT, { loose }), SIMPLE_ERROR_OBJECT)
  })
})

test('Serializing error object with deep error instances is not a noop', (t) => {
  const cause = new Error('causeMessage')
  const errors = [new Error('errorsMessage')]
  const object = { ...SIMPLE_ERROR_OBJECT, cause, errors }
  const error = serialize(object)
  t.not(error, object)
  t.deepEqual(error.cause, serialize(cause))
  t.deepEqual(error.errors[0], serialize(errors[0]))
})

test('Allow strings to parsed', (t) => {
  const message = 'test'
  t.is(parse(message).message, message)
})

test('Normalize invalid stack', (t) => {
  t.is(typeof parse({ ...SIMPLE_ERROR_OBJECT, stack: 0 }).stack, 'string')
})

test('Normalize invalid cause', (t) => {
  t.true(parse({ ...SIMPLE_ERROR_OBJECT, cause: 0 }).cause instanceof Error)
})

test('Normalize invalid aggregate errors', (t) => {
  t.true(
    parse({ ...SIMPLE_ERROR_OBJECT, errors: [0] }).errors[0] instanceof Error,
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
