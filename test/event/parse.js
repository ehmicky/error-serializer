import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

const addProp = function (errorObject) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  errorObject.prop = true
}

const addArgs = function (errorObject, ...args) {
  errorObject.set.add(args)
}

const addCause = function (errorObject, error) {
  errorObject.set.add(error.cause)
}

const unsafeEvent = function () {
  throw new Error('unsafe')
}

test('beforeParse() is called before parsing', (t) => {
  t.true('prop' in parse({ ...SIMPLE_ERROR_OBJECT }, { beforeParse: addProp }))
})

test('afterParse() is called after parsing', (t) => {
  t.false('prop' in parse({ ...SIMPLE_ERROR_OBJECT }, { afterParse: addProp }))
})

test('beforeParse() is called with the right arguments', (t) => {
  const set = new Set([])
  parse({ ...SIMPLE_ERROR_OBJECT, set }, { beforeParse: addArgs })
  t.deepEqual([...set], [[]])
})

test('afterParse() is called with the right arguments', (t) => {
  const set = new Set([])
  const error = parse({ ...SIMPLE_ERROR_OBJECT, set }, { afterParse: addArgs })
  t.deepEqual([...set], [[error]])
})

test('afterParse() is called after full parsing', (t) => {
  const set = new Set([])
  parse({ ...SIMPLE_ERROR_OBJECT, set, cause: true }, { afterParse: addCause })
  t.true([...set][0] instanceof Error)
})

each(['beforeParse', 'afterParse'], ({ title }, eventName) => {
  test(`Parsing events are called deeply | ${title}`, (t) => {
    const set = new Set([])
    parse({ deep: { ...SIMPLE_ERROR_OBJECT, set } }, { [eventName]: addArgs })
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
