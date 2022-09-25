import test from 'ava'
import { parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

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

test('constructorArgs can be unpacked', (t) => {
  t.deepEqual(
    parse(
      // eslint-disable-next-line unicorn/no-null
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: [null, true, false] },
      { classes: { CustomError } },
    ).args,
    [CUSTOM_ERROR_OBJECT.message, true, false],
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
