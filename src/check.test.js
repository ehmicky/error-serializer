import { runInNewContext } from 'node:vm'

import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT, FULL_ERROR } from './helpers/main.test.js'


const CORE_PROPS = ['name', 'message', 'stack']
const nonErrors = [
  undefined,
  null,
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

each(
  [
    ...nonErrors,
    ...CORE_PROPS.map((propName) => ({
      ...SIMPLE_ERROR_OBJECT,
      // eslint-disable-next-line fp/no-get-set
      get [propName]() {
        throw new Error('unsafe')
      },
    })),
  ],
  [true, false],
  ({ title }, value, shallow) => {
    test(`Non-errors are serialized by default | ${title}`, (t) => {
      t.is(typeof serialize(value, { shallow }).message, 'string')
    })

    test(`Non-error objects are parsed by default | ${title}`, (t) => {
      t.true(parse(value, { shallow }) instanceof Error)
    })
  },
)

each(nonErrors, [true, false], ({ title }, value, shallow) => {
  test(`Non-errors are kept during serialization with "loose: true" | ${title}`, (t) => {
    t.deepEqual(serialize(value, { shallow, loose: true }), value)
  })

  test(`Non-error objects are kept during parsing with "loose: true" | ${title}`, (t) => {
    t.deepEqual(parse(value, { shallow, loose: true }), value)
  })
})

test('Parsing an error instance with "loose: true" is a noop', (t) => {
  const error = new Error('test')
  t.is(parse(error, { loose: true }), error)
})

test('Serializing an error object with "loose: true" is a noop', (t) => {
  t.deepEqual(
    serialize(SIMPLE_ERROR_OBJECT, { loose: true }),
    SIMPLE_ERROR_OBJECT,
  )
})

test('Serializing a cross-realm error with "loose: true" is not a noop', (t) => {
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
