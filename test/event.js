import test from 'ava'
import { serialize, parse } from 'error-serializer'

import { SIMPLE_ERROR_OBJECT, FULL_ERROR } from './helpers/main.js'

const addProp = function (error) {
  error.prop = true
}

const addName = function (error) {
  error.propName = error.name
}

const addStack = function (error) {
  error.propStack = error.stack
}

const addGivenProp = function (error) {
  error.propProp = error.prop
}

const unsafeEvent = function () {
  throw new Error('unsafe')
}

test('beforeSerialize() is called', (t) => {
  t.true(serialize(FULL_ERROR, { beforeSerialize: addProp }).prop)
})

test('beforeSerialize() is called deeply', (t) => {
  t.true(
    serialize({ deep: FULL_ERROR }, { beforeSerialize: addProp }).deep.prop,
  )
})

test('beforeSerialize() is not called on non-errors', (t) => {
  t.false('prop' in serialize({}, { beforeSerialize: addProp }))
})

test('beforeSerialize() is called after normalization', (t) => {
  const error = new Error('test')
  error.name = true
  t.true(error.name)
  t.is(serialize(error, { beforeSerialize: addName }).propName, 'Error')
})

test('beforeSerialize() is ignored if throwing', (t) => {
  t.is(
    serialize(FULL_ERROR, { beforeSerialize: unsafeEvent }).name,
    FULL_ERROR.name,
  )
})

test('afterParse() is called', (t) => {
  t.true(parse({ ...SIMPLE_ERROR_OBJECT }, { afterParse: addProp }).prop)
})

test('afterParse() is called deeply', (t) => {
  t.true(
    parse({ deep: { ...SIMPLE_ERROR_OBJECT } }, { afterParse: addProp }).deep
      .prop,
  )
})

test('afterParse() is not called on non-errors', (t) => {
  t.false('prop' in parse({}, { afterParse: addProp }))
})

test('afterParse() is called after normalization', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT, stack: '' }
  t.true(
    parse(errorObject, { afterParse: addStack }).propStack.includes(
      SIMPLE_ERROR_OBJECT.name,
    ),
  )
})

test('afterParse() is called after full parsing', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT, prop: true }
  t.true(parse(errorObject, { afterParse: addGivenProp }).propProp)
})

test('afterParse() is ignored if throwing', (t) => {
  t.is(
    parse(SIMPLE_ERROR_OBJECT, { afterParse: unsafeEvent }).name,
    SIMPLE_ERROR_OBJECT.name,
  )
})
