import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

const isErrorInstance = function (error) {
  return error instanceof Error
}

each(
  [
    { propName: 'name', value: 'TypeError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('undefined').stack },
  ],
  ({ title }, { propName, value }) => {
    test(`Core error properties are set | ${title}`, (t) => {
      const error = parse({ ...SIMPLE_ERROR_OBJECT, [propName]: value })
      t.is(error[propName], value)
    })

    test(`Core error properties are not enumerable | ${title}`, (t) => {
      const error = parse({ ...SIMPLE_ERROR_OBJECT, [propName]: value })
      t.is({ ...error }[propName], undefined)
    })
  },
)

test('Cause is set', (t) => {
  const message = 'test'
  const error = parse({
    ...SIMPLE_ERROR_OBJECT,
    cause: { ...SIMPLE_ERROR_OBJECT, message },
  })
  t.true(isErrorInstance(error.cause))
  t.is(error.cause.message, message)
  t.is({ ...error }.cause, undefined)
})

test('Aggregate errors are set', (t) => {
  const message = 'test'
  const error = parse({
    ...SIMPLE_ERROR_OBJECT,
    errors: [{ ...SIMPLE_ERROR_OBJECT, message }],
  })
  t.true(isErrorInstance(error.errors[0]))
  t.is(error.errors[0].message, message)
  t.is({ ...error }.errors, undefined)
})

each(
  [
    { ...SIMPLE_ERROR_OBJECT, cause: true },
    { ...SIMPLE_ERROR_OBJECT, cause: { name: true } },
  ],
  ({ title }, object) => {
    test(`Invalid cause is normalized | ${title}`, (t) => {
      t.true(isErrorInstance(parse(object).cause))
    })
  },
)

each(
  [
    { ...SIMPLE_ERROR_OBJECT, errors: true },
    { ...SIMPLE_ERROR_OBJECT, errors: [undefined] },
    { ...SIMPLE_ERROR_OBJECT, errors: [{ name: true }] },
  ],
  ({ title }, object) => {
    test(`Invalid aggregate errors are normalized | ${title}`, (t) => {
      const { errors } = parse(object)
      t.true(!Array.isArray(errors) || errors.every(isErrorInstance))
    })
  },
)

each(['cause', 'errors'], ({ title }, propName) => {
  test(`Unsafe properties are ignored | ${title}`, (t) => {
    t.is(
      parse({
        ...SIMPLE_ERROR_OBJECT,
        // eslint-disable-next-line fp/no-get-set
        get [propName]() {
          throw new Error('unsafe')
        },
      }).cause,
      undefined,
    )
  })
})

test('Does not parse error.cause if it is an Error instance', (t) => {
  const cause = new Error('test')
  const error = { ...SIMPLE_ERROR_OBJECT, cause }
  t.is(parse(error).cause, cause)
})
