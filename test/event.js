import test from 'ava'
import { serialize, parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.js'

const addArgs = function (error, ...args) {
  error.args = args
}

const addProp = function (error) {
  error.prop = true
}

const addName = function (error) {
  error.propName = error.name
}

const addSetArgs = function (errorObject, ...args) {
  errorObject.set.add(args)
}

const unsafeEvent = function () {
  throw new Error('unsafe')
}

test('beforeSerialize() is called before serialization', (t) => {
  const error = new Error('test')
  t.true(serialize(error, { beforeSerialize: addProp }).prop)
})

test('afterSerialize() is called after serialization', (t) => {
  const error = new Error('test')
  t.false('prop' in serialize(error, { afterSerialize: addProp }))
})

each(['beforeSerialize', 'afterSerialize'], ({ title }, eventName) => {
  test(`Serialization events are called | ${title}`, (t) => {
    const error = new Error('test')
    serialize(error, { [eventName]: addArgs })
    t.deepEqual(error.args, [])
  })

  test(`Serialization events are called deeply | ${title}`, (t) => {
    const error = new Error('test')
    serialize({ deep: error }, { [eventName]: addProp })
    t.true(error.prop)
  })

  test(`Serialization events are not called on non-errors | ${title}`, (t) => {
    const nonError = {}
    serialize(nonError, { [eventName]: addProp })
    t.false('prop' in nonError)
  })

  test(`Serialization events are called after normalization | ${title}`, (t) => {
    const error = new Error('test')
    error.name = true
    serialize(error, { [eventName]: addName })
    t.is(error.propName, 'Error')
  })

  test(`Serialization events are ignored if throwing | ${title}`, (t) => {
    const error = new Error('test')
    t.is(serialize(error, { [eventName]: unsafeEvent }).name, 'Error')
  })
})

test('beforeParse() is called before parsing', (t) => {
  t.true(parse({ ...SIMPLE_ERROR_OBJECT }, { beforeParse: addProp }).prop)
})

test('afterParse() is called after parsing', (t) => {
  t.false('prop' in parse({ ...SIMPLE_ERROR_OBJECT }, { afterParse: addProp }))
})

each(['beforeParse', 'afterParse'], ({ title }, eventName) => {
  test(`Parsing events are called | ${title}`, (t) => {
    const set = new Set([])
    parse({ ...SIMPLE_ERROR_OBJECT, set }, { [eventName]: addSetArgs })
    t.deepEqual([...set], [[]])
  })

  test(`Parsing events are called deeply | ${title}`, (t) => {
    const set = new Set([])
    parse(
      { deep: { ...SIMPLE_ERROR_OBJECT, set } },
      { [eventName]: addSetArgs },
    )
    t.is([...set].length, 1)
  })

  test(`Parsing events are not called on non-error objects | ${title}`, (t) => {
    const nonError = {}
    parse(nonError, { [eventName]: addProp })
    t.false('prop' in nonError)
  })

  test(`Parsing events are ignored if throwing | ${title}`, (t) => {
    t.is(
      parse({ ...SIMPLE_ERROR_OBJECT }, { [eventName]: unsafeEvent }).name,
      SIMPLE_ERROR_OBJECT.name,
    )
  })
})
