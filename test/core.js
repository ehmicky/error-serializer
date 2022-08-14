import test from 'ava'
import { serialize, parse } from 'error-serializer'

test('Keep non-core properties when serializing', (t) => {
  const error = new Error('test')
  error.prop = true
  t.is(serialize(error).prop, error.prop)
})

test('Keep non-core properties when parsing', (t) => {
  t.true(parse({ prop: true }).prop)
})

test('Does not serialize non-core properties recursively', (t) => {
  const error = new Error('test')
  error.one = { two: true, three: new Error('inner') }
  t.deepEqual(serialize(error).one, { two: error.one.two, three: {} })
})

test('Does not parse non-core properties recursively', (t) => {
  t.false(parse({ prop: {} }).prop instanceof Error)
})

test('Ignore non-enumerable properties when serializing', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'prop', {
    value: true,
    enumerable: false,
    writable: true,
    configurable: true,
  })
  t.is(serialize(error).prop, undefined)
})

test('Ignore non-enumerable properties when parsing', (t) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const object = Object.defineProperty({}, 'prop', {
    value: true,
    enumerable: false,
    writable: true,
    configurable: true,
  })
  t.is(parse(object).prop, undefined)
})

test('Ignore inherited properties when serializing', (t) => {
  // eslint-disable-next-line fp/no-class
  class CustomError extends Error {}
  // eslint-disable-next-line fp/no-mutation
  CustomError.prototype.prop = true
  t.is(serialize(new CustomError('test')).prop, undefined)
})

test('Ignore inherited properties when parsing', (t) => {
  // eslint-disable-next-line fp/no-class
  class Example {}
  // eslint-disable-next-line fp/no-mutation
  Example.prototype.prop = true
  t.is(parse(new Example()).prop, undefined)
})

test('Ignore symbol properties when serializing', (t) => {
  const error = new Error('test')
  const symbol = Symbol('test')
  error[symbol] = true
  t.is(serialize(error)[symbol], undefined)
})

test('Ignore symbol properties when parsing', (t) => {
  const symbol = Symbol('test')
  t.is(parse({ [symbol]: true })[symbol], undefined)
})

test('Ignore toJSON() when serializing', (t) => {
  const error = new Error('test')
  error.toJSON = () => ({})
  t.is(serialize(error).message, error.message)
})

test('Ignore unsafe non-core properties when serializing', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'prop', {
    get() {
      throw new Error('unsafe')
    },
    enumerable: true,
    configurable: true,
  })
  t.is(serialize(error).prop, undefined)
})

test('Ignore unsafe non-core properties when parsing', (t) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const object = Object.defineProperty({}, 'prop', {
    get() {
      throw new Error('unsafe')
    },
    enumerable: true,
    configurable: true,
  })
  t.is(serialize(object).prop, undefined)
})