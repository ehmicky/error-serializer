import test from 'ava'
import { serialize } from 'error-serializer'

test('Keep non-core properties', (t) => {
  const error = new Error('test')
  error.prop = true
  t.is(serialize(error).prop, error.prop)
})

test('Does not serialize non-core properties recursively', (t) => {
  const error = new Error('test')
  error.one = { two: true, three: new Error('inner') }
  t.deepEqual(serialize(error).one, { two: error.one.two, three: {} })
})

test('Ignore non-enumerable properties', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'prop', {
    value: true,
    enumerable: false,
    writable: true,
    configurable: true,
  })
  t.is(serialize(error).prop)
})

test('Ignore inherited properties', (t) => {
  class CustomError extends Error {}
  CustomError.prototype.prop = true
  t.is(serialize(new CustomError('test')).prop)
})

test('Keep symbol properties', (t) => {
  const error = new Error('test')
  const symbol = Symbol()
  error[symbol] = true
  t.is(serialize(error)[symbol])
})

test('Ignore toJSON()', (t) => {
  const error = new Error('test')
  error.toJSON = () => ({})
  t.is(serialize(error).message, error.message)
})

test('Ignore unsafe properties', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'prop', {
    get() {
      throw new Error('unsafe')
    },
    enumerable: true,
    configurable: true,
  })
  t.is(serialize(error).prop)
})
