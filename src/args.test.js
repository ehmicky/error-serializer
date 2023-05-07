import test from 'ava'
import { parse, serialize } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.test.js'


// eslint-disable-next-line fp/no-class
class CustomError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-mutation, fp/no-this
    this.args = args

    if (args[0] === 'setConstructorArgs') {
      // eslint-disable-next-line fp/no-mutation, fp/no-this
      this.constructorArgs = args
    }
  }
}

// eslint-disable-next-line fp/no-class
class UnsafeError extends Error {
  constructor() {
    throw new Error('unsafe')
  }
}

const CUSTOM_ERROR_OBJECT = { ...SIMPLE_ERROR_OBJECT, name: CustomError.name }
const UNSAFE_ERROR_OBJECT = { ...SIMPLE_ERROR_OBJECT, name: UnsafeError.name }

test('constructorArgs can be parsed', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [true] },
      { classes: { CustomError } },
    ).args,
    [true],
  )
})

test('constructorArgs can be unpacked', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [null, true, false] },
      { classes: { CustomError } },
    ).args,
    [CUSTOM_ERROR_OBJECT.message, true, false],
  )
})

test('constructorArgs that are not arrays are ignored', (t) => {
  t.false(
    'args' in
      parse(
        { ...CUSTOM_ERROR_OBJECT, constructorArgs: true },
        { classes: { CustomError } },
      ),
  )
})

test('constructorArgs are removed during parsing', (t) => {
  t.false(
    'constructorArgs' in
      parse(
        { ...CUSTOM_ERROR_OBJECT, constructorArgs: [true] },
        { classes: { CustomError } },
      ),
  )
})

test('constructorArgs are not removed during parsing if set by the constructor', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: ['setConstructorArgs'] },
      { classes: { CustomError } },
    ).constructorArgs,
    ['setConstructorArgs'],
  )
})

test('Properties set by constructor are overridden by serialized ones', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [true], args: [false] },
      { classes: { CustomError } },
    ).args,
    [false],
  )
})

test('Handle unsafe constructors', (t) => {
  t.is(
    parse(
      { ...UNSAFE_ERROR_OBJECT, constructorArgs: [] },
      { classes: { UnsafeError } },
    ).name,
    'Error',
  )
})

test('constructorArgs can be set', (t) => {
  const error = new Error('test')
  error.constructorArgs = [true]
  t.deepEqual(serialize(error).constructorArgs, [true])
})

test('constructorArgs can be non-enumerable', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'constructorArgs', {
    value: [true],
    enumerable: false,
    writable: true,
    configurable: true,
  })
  const newError = serialize(error)
  t.deepEqual(newError.constructorArgs, [true])
  t.true(
    Object.getOwnPropertyDescriptor(newError, 'constructorArgs').enumerable,
  )
})

const getArguments = function () {
  // eslint-disable-next-line fp/no-arguments, prefer-rest-params
  return arguments
}

test('constructorArgs cannot be "arguments"', (t) => {
  const error = new Error('test')
  error.constructorArgs = getArguments(true)
  t.false('constructorArgs' in serialize(error))
})

each(
  [
    { beforePack: ['test'], afterPack: undefined },
    { beforePack: ['test', {}], afterPack: undefined },
    { beforePack: ['other'], afterPack: ['other'] },
    { beforePack: ['other', {}], afterPack: ['other', {}] },
    ...[true, null, { test: true }].map((secondArg) => ({
      beforePack: ['test', secondArg],
      afterPack: [null, secondArg],
    })),
  ],
  ({ title }, { beforePack, afterPack }) => {
    test(`constructorArgs packs messages | ${title}`, (t) => {
      const error = new Error('test')
      error.constructorArgs = beforePack
      t.deepEqual(serialize(error).constructorArgs, afterPack)
    })
  },
)
