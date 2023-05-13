import test from 'ava'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from './helpers/main.test.js'

import { parse, serialize } from 'error-serializer'

const addErrorProp = (error) => {
  error.prop = true
}

const addErrorArgs = (error, ...args) => {
  error.args = args
}

const addErrorName = (error) => {
  error.propName = error.name
}

const unsafeEvent = () => {
  throw new Error('unsafe')
}

test('beforeSerialize() is called before serialization', (t) => {
  const error = new Error('test')
  t.true('prop' in serialize(error, { beforeSerialize: addErrorProp }))
})

test('afterSerialize() is called after serialization', (t) => {
  const error = new Error('test')
  t.false('prop' in serialize(error, { afterSerialize: addErrorProp }))
})

test('beforeSerialize() is called with the right arguments', (t) => {
  const error = new Error('test')
  t.deepEqual(serialize(error, { beforeSerialize: addErrorArgs }).args, [])
})

test('afterSerialize() is called with the right arguments', (t) => {
  const error = new Error('test')
  const errorObject = serialize(error, { afterSerialize: addErrorArgs })
  t.deepEqual(error.args, [errorObject])
})

test('afterSerialize() is called after full serialization', (t) => {
  const error = new Error('test')
  const date = new Date()
  error.date = date
  serialize(error, { afterSerialize: addErrorArgs })
  t.is(error.args[0].date, date.toJSON())
})

each(['beforeSerialize', 'afterSerialize'], ({ title }, eventName) => {
  test(`Serialization events are called deeply | ${title}`, (t) => {
    const error = new Error('test')
    serialize({ deep: error }, { loose: true, [eventName]: addErrorProp })
    t.true(error.prop)
  })

  test(`Serialization events are not called on non-errors | ${title}`, (t) => {
    const nonError = {}
    serialize(nonError, { [eventName]: addErrorProp })
    t.false('prop' in nonError)
  })

  test(`Serialization events are called after normalization | ${title}`, (t) => {
    const error = new Error('test')
    error.name = true
    serialize(error, { [eventName]: addErrorName })
    t.is(error.propName, 'Error')
  })

  test(`Serialization events are ignored if throwing | ${title}`, (t) => {
    const error = new Error('test')
    t.is(serialize(error, { [eventName]: unsafeEvent }).name, 'Error')
  })
})

const addObjectProp = (errorObject) => {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  errorObject.prop = true
}

const addObjectArgs = (errorObject, ...args) => {
  errorObject.set.add(args)
}

const addObjectCause = (errorObject, error) => {
  errorObject.set.add(error.cause)
}

test('beforeParse() is called before parsing', (t) => {
  t.true(
    'prop' in parse({ ...SIMPLE_ERROR_OBJECT }, { beforeParse: addObjectProp }),
  )
})

test('afterParse() is called after parsing', (t) => {
  t.false(
    'prop' in parse({ ...SIMPLE_ERROR_OBJECT }, { afterParse: addObjectProp }),
  )
})

test('beforeParse() is called with the right arguments', (t) => {
  const set = new Set([])
  parse({ ...SIMPLE_ERROR_OBJECT, set }, { beforeParse: addObjectArgs })
  t.deepEqual([...set], [[]])
})

test('afterParse() is called with the right arguments', (t) => {
  const set = new Set([])
  const error = parse(
    { ...SIMPLE_ERROR_OBJECT, set },
    { afterParse: addObjectArgs },
  )
  t.deepEqual([...set], [[error]])
})

test('afterParse() is called after full parsing', (t) => {
  const set = new Set([])
  parse(
    { ...SIMPLE_ERROR_OBJECT, set, cause: true },
    { afterParse: addObjectCause },
  )
  t.true([...set][0] instanceof Error)
})

each(['beforeParse', 'afterParse'], ({ title }, eventName) => {
  test(`Parsing events are called deeply | ${title}`, (t) => {
    const set = new Set([])
    parse(
      { deep: { ...SIMPLE_ERROR_OBJECT, set } },
      { loose: true, [eventName]: addObjectArgs },
    )
    t.is(set.size, 1)
  })

  test(`Parsing events are not called on non-error objects | ${title}`, (t) => {
    const nonError = {}
    parse(nonError, { [eventName]: addObjectProp })
    t.false('prop' in nonError)
  })

  test(`Parsing events are ignored if throwing | ${title}`, (t) => {
    t.is(
      parse({ ...SIMPLE_ERROR_OBJECT }, { [eventName]: unsafeEvent }).name,
      SIMPLE_ERROR_OBJECT.name,
    )
  })
})
