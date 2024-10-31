import test from 'ava'

import {
  addProp,
  setErrorNames,
  setTransformArgs,
  SIMPLE_ERROR_OBJECT,
  unsafeTransform,
} from './helpers/main.test.js'

import { parse } from 'error-serializer'

test('transformInstance() is called during parsing', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT }
  t.true(parse(errorObject, { transformInstance: addProp }).prop)
  t.false('prop' in errorObject)
})

test('transformInstance() is called with the right arguments', (t) => {
  const state = {}
  const errorObject = { ...SIMPLE_ERROR_OBJECT }
  const error = parse(errorObject, {
    transformInstance: setTransformArgs.bind(undefined, state),
  })
  t.deepEqual(state.args, [error, errorObject])
})

test('transformInstance() is called after normalization', (t) => {
  const errorObject = { ...SIMPLE_ERROR_OBJECT, name: '' }
  const error = parse(errorObject, { transformInstance: setErrorNames })
  t.deepEqual(error.names, ['Error', ''])
})

test('transformInstance() is called deeply', (t) => {
  const error = parse(
    { deep: { ...SIMPLE_ERROR_OBJECT } },
    { loose: true, transformInstance: addProp },
  )
  t.true(error.deep.prop)
})

test('transformInstance() is called bottom-up', (t) => {
  const errorObject = {
    ...SIMPLE_ERROR_OBJECT,
    cause: { ...SIMPLE_ERROR_OBJECT },
  }
  const causes = []
  const error = parse(errorObject, {
    transformInstance: ({ cause }) => {
      causes.push(cause)
    },
  })
  t.deepEqual(causes, [undefined, error.cause])
})

test('transformInstance() is called on non-error objects if not loose', (t) => {
  t.true('prop' in parse({}, { transformInstance: addProp }))
})

test('transformInstance() is not called on non-error objects if loose', (t) => {
  t.false('prop' in parse({}, { transformInstance: addProp, loose: true }))
})

test('transformInstance() is ignored if throwing', (t) => {
  t.is(
    parse(
      { ...SIMPLE_ERROR_OBJECT, name: 'TypeError' },
      { transformInstance: unsafeTransform },
    ).name,
    'TypeError',
  )
})
