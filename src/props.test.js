import test from 'ava'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.test.js'

import { parse, serialize } from 'error-serializer'

test('Keep non-core properties when serializing', (t) => {
  const error = new Error('test')
  error.prop = true
  t.is(serialize(error).prop, error.prop)
})

test('Keep non-core properties when parsing', (t) => {
  t.true(parse({ ...SIMPLE_ERROR_OBJECT, prop: true }).prop)
})

test('Serializes non-core properties recursively', (t) => {
  const error = new Error('test')
  error.one = {}
  error.one.two = new Error('inner')
  t.deepEqual(serialize(error).one.two, serialize(error.one.two))
})

test('Parses non-core properties recursively', (t) => {
  const object = { ...SIMPLE_ERROR_OBJECT, one: { two: SIMPLE_ERROR_OBJECT } }
  t.deepEqual(parse(object).one.two, parse(object.one.two))
})

const DESCRIPTOR = {
  value: true,
  enumerable: false,
  writable: true,
  configurable: true,
}

test('Ignore non-enumerable properties when serializing', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'prop', DESCRIPTOR)
  t.is(serialize(error).prop, undefined)
})

test('Ignore non-enumerable properties when parsing', (t) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const object = Object.defineProperty(SIMPLE_ERROR_OBJECT, 'prop', DESCRIPTOR)
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
  t.is(parse({ ...SIMPLE_ERROR_OBJECT, [symbol]: true })[symbol], undefined)
})

test('Ignore undefined properties when serializing', (t) => {
  const error = new Error('test')
  error.prop = undefined
  t.false('prop' in serialize(error))
})

test('Ignore undefined properties when parsing', (t) => {
  t.false('prop' in parse({ ...SIMPLE_ERROR_OBJECT, prop: undefined }))
})

test('Ignore toJSON() when serializing', (t) => {
  const error = new Error('test')
  error.toJSON = () => ({})
  t.is(serialize(error).message, error.message)
})

const UNSAFE_DESCRIPTOR = {
  get: () => {
    throw new Error('unsafe')
  },
  enumerable: true,
  configurable: true,
}

each([{}, new Error('test')], ({ title }, value) => {
  test(`Ignore unsafe non-core properties when serializing | ${title}`, (t) => {
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(value, 'prop', UNSAFE_DESCRIPTOR)
    t.is(serialize(value).prop, undefined)
  })
})

each([{}, { ...SIMPLE_ERROR_OBJECT }], ({ title }, object) => {
  test(`Ignore unsafe non-core properties when parsing | ${title}`, (t) => {
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(object, 'prop', UNSAFE_DESCRIPTOR)
    t.is(parse(object).prop, undefined)
  })
})
