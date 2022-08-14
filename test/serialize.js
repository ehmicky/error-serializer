import test from 'ava'
import { serialize, parse } from 'error-serializer'
import isPlainObj from 'is-plain-obj'
import { each } from 'test-each'

const normalError = new Error('test')
// eslint-disable-next-line fp/no-mutation
normalError.cause = new Error('inner')
// eslint-disable-next-line fp/no-mutation
normalError.errors = [new Error('otherInner')]

const serializedNormalError = serialize(normalError)

each(['name', 'message', 'stack'], ({ title }, propName) => {
  test(`Serializes error core property | ${title}`, (t) => {
    t.is(serializedNormalError[propName], normalError[propName])
  })

  test(`Serializes error cause | ${title}`, (t) => {
    t.is(serializedNormalError.cause[propName], normalError.cause[propName])
  })

  test(`Serializes aggregate errors | ${title}`, (t) => {
    t.is(
      serializedNormalError.errors[0][propName],
      normalError.errors[0][propName],
    )
  })
})

test('Converts errors to plain objects', (t) => {
  t.true(isPlainObj(serializedNormalError))
  t.true(isPlainObj(serializedNormalError.cause))
  t.true(isPlainObj(serializedNormalError.errors[0]))
})

const recursiveCauseError = new Error('test')
// eslint-disable-next-line fp/no-mutation
recursiveCauseError.cause = recursiveCauseError

test('Handle recursion in cause', (t) => {
  t.is(serialize(recursiveCauseError).cause, undefined)
})

const recursiveAggregateError = new Error('test')
// eslint-disable-next-line fp/no-mutation
recursiveAggregateError.errors = [recursiveAggregateError]

test('Handle recursion in aggregate errors', (t) => {
  t.deepEqual(serialize(recursiveAggregateError).errors, [])
})

test('Can be used as toJSON()', (t) => {
  // eslint-disable-next-line fp/no-class
  class CustomError extends Error {
    toJSON() {
      // eslint-disable-next-line fp/no-this
      return serialize(this)
    }
  }
  const message = 'test'
  t.is(new CustomError(message).toJSON().message, message)
})

test('Can serialize and parse deeply', (t) => {
  const jsonString = JSON.stringify([normalError, true], (key, value) =>
    serialize(value, { loose: true }),
  )
  const [object, item] = JSON.parse(jsonString, (key, value) =>
    parse(value, { loose: true }),
  )
  t.deepEqual(object, normalError)
  t.true(item)
})
