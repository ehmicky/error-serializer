import { runInNewContext } from 'vm'

import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT, FULL_ERROR } from './helpers/main.js'

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

test('Parsing an error instances with "loose" option is a noop', (t) => {
  const error = new Error('test')
  t.is(parse(error, { loose: true }), error)
})

test('Serializing an error object with "loose" option is a noop', (t) => {
  t.is(serialize(SIMPLE_ERROR_OBJECT, { loose: true }), SIMPLE_ERROR_OBJECT)
})

test('Serializing a cross-realm error with "loose" option is not a noop', (t) => {
  const error = runInNewContext('new Error("test")')
  t.not(serialize(error, { loose: true }), error)
})

test('parse() and serialize() undo each other', (t) => {
  const object = serialize(FULL_ERROR)
  const error = parse(object)
  t.deepEqual(error, FULL_ERROR)
  const objectA = serialize(error)
  t.deepEqual(objectA, object)
})
