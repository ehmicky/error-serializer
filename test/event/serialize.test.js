import test from 'ava'
import { serialize } from 'error-serializer'
import { each } from 'test-each'

const addProp = function (error) {
  error.prop = true
}

const addArgs = function (error, ...args) {
  error.args = args
}

const addName = function (error) {
  error.propName = error.name
}

const unsafeEvent = function () {
  throw new Error('unsafe')
}

test('beforeSerialize() is called before serialization', (t) => {
  const error = new Error('test')
  t.true('prop' in serialize(error, { beforeSerialize: addProp }))
})

test('afterSerialize() is called after serialization', (t) => {
  const error = new Error('test')
  t.false('prop' in serialize(error, { afterSerialize: addProp }))
})

test('beforeSerialize() is called with the right arguments', (t) => {
  const error = new Error('test')
  t.deepEqual(serialize(error, { beforeSerialize: addArgs }).args, [])
})

test('afterSerialize() is called with the right arguments', (t) => {
  const error = new Error('test')
  const errorObject = serialize(error, { afterSerialize: addArgs })
  t.deepEqual(error.args, [errorObject])
})

test('afterSerialize() is called after full serialization', (t) => {
  const error = new Error('test')
  const date = new Date()
  error.date = date
  serialize(error, { afterSerialize: addArgs })
  t.is(error.args[0].date, date.toJSON())
})

each(['beforeSerialize', 'afterSerialize'], ({ title }, eventName) => {
  test(`Serialization events are called deeply | ${title}`, (t) => {
    const error = new Error('test')
    serialize({ deep: error }, { loose: true, [eventName]: addProp })
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
