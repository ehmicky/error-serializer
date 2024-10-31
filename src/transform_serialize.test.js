import test from 'ava'

import {
  addProp,
  setErrorNames,
  setTransformArgs,
  unsafeTransform,
} from './helpers/main.test.js'

import { serialize } from 'error-serializer'

test('transformObject() is called during serialization', (t) => {
  const error = new Error('test')
  t.true(serialize(error, { transformObject: addProp }).prop)
  t.false('prop' in error)
})

test('transformObject() is called with the right arguments', (t) => {
  const state = {}
  const error = new Error('test')
  const errorObject = serialize(error, {
    transformObject: setTransformArgs.bind(undefined, state),
  })
  t.deepEqual(state.args, [errorObject, error])
})

test('transformObject() is called after normalization', (t) => {
  const error = new TypeError('test')
  error.name = true
  const errorObject = serialize(error, { transformObject: setErrorNames })
  t.deepEqual(errorObject.names, ['TypeError', 'TypeError'])
})

test('transformObject() is called before full serialization', (t) => {
  const state = {}
  const error = new Error('test')
  const date = new Date()
  error.date = date
  serialize(error, { transformObject: setTransformArgs.bind(undefined, state) })
  t.is(state.args[0].date, date)
})

test('transformObject() is called deeply', (t) => {
  const error = new Error('test')
  const errorObject = serialize(
    { deep: error },
    { loose: true, transformObject: addProp },
  )
  t.true(errorObject.deep.prop)
})

test('transformObject() is called bottom-up', (t) => {
  const causes = []
  const errorObject = serialize(new Error('test', { cause: 'cause' }), {
    transformObject: ({ cause }) => {
      causes.push(cause)
    },
  })
  t.deepEqual(causes, [undefined, errorObject.cause])
})

test('transformObject() is called on non-errors if not loose', (t) => {
  t.true('prop' in serialize({}, { transformObject: addProp }))
})

test('transformObject() is not called on non-errors if loose', (t) => {
  t.false('prop' in serialize({}, { transformObject: addProp, loose: true }))
})

test('transformObject() is ignored if throwing', (t) => {
  const error = new Error('test')
  t.is(serialize(error, { transformObject: unsafeTransform }).name, 'Error')
})
