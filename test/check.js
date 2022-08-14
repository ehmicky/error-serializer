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
      {
        ...SIMPLE_ERROR_OBJECT,
        // eslint-disable-next-line fp/no-get-set
        get [propName]() {
          throw new Error('unsafe')
        },
      },
    ]),
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

test('Error instances are returned with parse() and "loose" option', (t) => {
  const error = new Error('test')
  t.is(parse(error, { loose: true }), error)
})

test('Error objects are returned with serialize() and "loose" option', (t) => {
  t.is(serialize(SIMPLE_ERROR_OBJECT, { loose: true }), SIMPLE_ERROR_OBJECT)
})

test('Serializing a cross-realm error with "loose" option is not a noop', (t) => {
  const error = runInNewContext('new Error("test")')
  t.not(serialize(error, { loose: true }), error)
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
