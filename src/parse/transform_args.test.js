import test from 'ava'

import { CUSTOM_ERROR_OBJECT, CustomError } from '../helpers/main.test.js'

import { parse } from 'error-serializer'

test('Constructor is not called if neither transformArgs() nor constructorArgs is defined', (t) => {
  t.false(
    'args' in parse({ ...CUSTOM_ERROR_OBJECT }, { classes: { CustomError } }),
  )
})

test('Constructor is called if constructorArgs is defined', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: ['test'] },
      { classes: { CustomError } },
    ).args,
    ['test'],
  )
})

test('Constructor is called if transformArgs() is defined', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT },
      { classes: { CustomError }, transformArgs: () => {} },
    ).args,
    [CUSTOM_ERROR_OBJECT.message],
  )
})

test('transformArgs() is applied on the message', (t) => {
  t.is(
    parse(
      { ...CUSTOM_ERROR_OBJECT, message: 'test' },
      {
        classes: { CustomError },
        transformArgs: (args) => {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          args[0] = args[0].toUpperCase()
        },
      },
    ).message,
    'TEST',
  )
})

test('transformArgs() can add a second argument', (t) => {
  const cause = new Error('test')
  t.is(
    parse(
      { ...CUSTOM_ERROR_OBJECT },
      {
        classes: { CustomError },
        transformArgs: (args) => {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          args[1] = { cause }
        },
      },
    ).cause,
    cause,
  )
})

test('transformArgs() can transform constructorArgs[1]', (t) => {
  const cause = new Error('test')
  t.is(
    parse(
      { ...CUSTOM_ERROR_OBJECT, constructorArgs: ['', { cause }] },
      {
        classes: { CustomError },
        transformArgs: (args) => {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          args[1].cause.message = args[1].cause.message.toUpperCase()
        },
      },
    ).cause.message,
    'TEST',
  )
})

test('Handle unsafe transformArgs()', (t) => {
  t.deepEqual(
    parse(
      { ...CUSTOM_ERROR_OBJECT },
      {
        classes: { CustomError },
        transformArgs: () => {
          throw new Error('unsafe')
        },
      },
    ).args,
    [CUSTOM_ERROR_OBJECT.message],
  )
})

test('errorObject is passed to transformArgs()', (t) => {
  t.is(
    parse(
      { ...CUSTOM_ERROR_OBJECT, prop: 'test' },
      {
        classes: { CustomError },
        transformArgs: (args, { prop }) => {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          args[0] = prop
        },
      },
    ).message,
    'test',
  )
})

test('ErrorClass is passed to transformArgs()', (t) => {
  t.is(
    parse(
      { ...CUSTOM_ERROR_OBJECT },
      {
        classes: { CustomError },
        transformArgs: (args, errorObject, ErrorClass) => {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          args[0] = ErrorClass.name
        },
      },
    ).message,
    CUSTOM_ERROR_OBJECT.name,
  )
})
