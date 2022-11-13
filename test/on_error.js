import test from 'ava'
import { serialize, parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT, FULL_ERROR } from './helpers/main.js'

const onError = function (error) {
  error.prop = true
}

const onErrorName = function (error) {
  error.propName = error.name
}

const onErrorStack = function (error) {
  error.propStack = error.stack
}

const onErrorProp = function (error) {
  error.propProp = error.prop
}

const onErrorUnsafe = function () {
  throw new Error('unsafe')
}

test('onError() is called when serializing', (t) => {
  t.true(serialize(FULL_ERROR, { onError }).prop)
})

test('onError() is called deeply when serializing', (t) => {
  t.true(serialize({ deep: FULL_ERROR }, { onError }).deep.prop)
})

test('onError() is not called on non-errors when serializing', (t) => {
  t.false('prop' in serialize({}, { onError }))
})

test('onError() is called after normalization when serializing', (t) => {
  const error = new Error('test')
  error.name = true
  t.true(error.name)
  t.is(serialize(error, { onError: onErrorName }).propName, 'Error')
})

test('onError() is ignored if throwing when serializing', (t) => {
  t.is(serialize(FULL_ERROR, { onError: onErrorUnsafe }).name, FULL_ERROR.name)
})

test('onError() is called when parsing', (t) => {
  t.true(parse({ ...SIMPLE_ERROR_OBJECT }, { onError }).prop)
})

test('onError() is called deeply when parsing', (t) => {
  t.true(parse({ deep: { ...SIMPLE_ERROR_OBJECT } }, { onError }).deep.prop)
})

test('onError() is not called on non-errors when parsing', (t) => {
  t.false('prop' in parse({}, { onError }))
})

test('onError() is called after normalization when parsing', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT, stack: '' }
  t.true(
    parse(errorObject, { onError: onErrorStack }).propStack.includes(
      SIMPLE_ERROR_OBJECT.name,
    ),
  )
})

test('onError() is called after full parsing', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT, prop: true }
  t.true(parse(errorObject, { onError: onErrorProp }).propProp)
})

test('onError() is ignored if throwing when parsing', (t) => {
  t.is(
    parse(SIMPLE_ERROR_OBJECT, { onError: onErrorUnsafe }).name,
    SIMPLE_ERROR_OBJECT.name,
  )
})
