import test from 'ava'
import { serialize, parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.js'

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

// eslint-disable-next-line fp/no-class
class CustomError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-mutation, fp/no-this
    this.args = args
  }
}

const CUSTOM_ERROR_OBJECT = { ...SIMPLE_ERROR_OBJECT, name: CustomError.name }

test('constructorArgs can be parsed', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [true] },
      { classes: { CustomError } },
    ).args,
    [true],
  )
})

test('constructorArgs that are not arrays are ignored', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: true },
      { classes: { CustomError } },
    ).args,
    [CUSTOM_ERROR_OBJECT.message, {}],
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

test('Properties set by constructor are overridden by serialized ones', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [true], args: [false] },
      { classes: { CustomError } },
    ).args,
    [false],
  )
})
