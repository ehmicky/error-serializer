import { runInNewContext } from 'vm'

import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT, FULL_ERROR } from './helpers/main.js'

const CORE_PROPS = ['name', 'message', 'stack']
const nonErrors = [
  undefined,
  // eslint-disable-next-line unicorn/no-null
  null,
  // eslint-disable-next-line no-magic-numbers
  0n,
  'message',
  {},
  ...CORE_PROPS.flatMap((propName) => [
    { ...SIMPLE_ERROR_OBJECT, [propName]: undefined },
    { ...SIMPLE_ERROR_OBJECT, [propName]: true },
  ]),
  [],
  () => {},
]

each(nonErrors, [true, false], ({ title }, value, shallow) => {
  test(`Non-errors are not serialized without "normalize: true" | ${title}`, (t) => {
    t.deepEqual(serialize(value, { shallow }), value)
  })

  test(`Non-error objects are not parsed without "normalize: true" | ${title}`, (t) => {
    t.deepEqual(parse(value, { shallow }), value)
  })
})

each(
  [
    ...nonErrors,
    ...CORE_PROPS.map((propName) =>
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty({ ...SIMPLE_ERROR_OBJECT }, propName, {
        get() {
          throw new Error('unsafe')
        },
      }),
    ),
  ],
  [true, false],
  ({ title }, value, shallow) => {
    test(`Non-errors are serialized with "normalize: true" | ${title}`, (t) => {
      t.is(
        typeof serialize(value, { normalize: true, shallow }).message,
        'string',
      )
    })

    test(`Non-error objects are parsed with "normalize: true" | ${title}`, (t) => {
      t.true(parse(value, { normalize: true, shallow }) instanceof Error)
    })
  },
)

test('Parsing an error instance without "normalize: true" is a noop', (t) => {
  const error = new Error('test')
  t.is(parse(error), error)
})

test('Serializing an error object without "normalize: true" is a noop', (t) => {
  t.deepEqual(serialize(SIMPLE_ERROR_OBJECT), SIMPLE_ERROR_OBJECT)
})

test('Serializing a cross-realm error without "normalize: true" is not a noop', (t) => {
  const error = runInNewContext('new Error("test")')
  t.not(serialize(error), error)
})

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

test('parse() and serialize() undo each other', (t) => {
  const object = serialize(FULL_ERROR)
  const error = parse(object)
  t.deepEqual(error, FULL_ERROR)
  const objectA = serialize(error)
  t.deepEqual(objectA, object)
})
