import test from 'ava'
import { parse } from 'error-serializer'
import isErrorInstance from 'is-error-instance'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.test.js'


each(
  [
    { propName: 'name', value: 'TypeError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('undefined').stack },
    { propName: 'lineNumber', value: 0 },
    { propName: 'columnNumber', value: 0 },
    { propName: 'fileName', value: 'file.js' },
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
  const errors = [{ ...SIMPLE_ERROR_OBJECT, message }]
  const error = parse({ ...SIMPLE_ERROR_OBJECT, errors })
  t.true(isErrorInstance(error.errors[0]))
  t.is(error.errors[0].message, message)
  t.is({ ...error }.errors, undefined)
})

each([true, { name: true }], ({ title }, cause) => {
  test(`Invalid cause is normalized | ${title}`, (t) => {
    t.true(isErrorInstance(parse({ ...SIMPLE_ERROR_OBJECT, cause }).cause))
  })
})

each([true, [undefined], [{ name: true }]], ({ title }, errors) => {
  test(`Invalid aggregate errors are normalized | ${title}`, (t) => {
    const { errors: errorsA } = parse({ ...SIMPLE_ERROR_OBJECT, errors })
    t.true(!Array.isArray(errorsA) || errorsA.every(isErrorInstance))
  })
})

each(['cause', 'errors'], [true, false], ({ title }, propName, shallow) => {
  test(`Unsafe properties are ignored | ${title}`, (t) => {
    t.is(
      parse(
        {
          ...SIMPLE_ERROR_OBJECT,
          // eslint-disable-next-line fp/no-get-set
          get [propName]() {
            throw new Error('unsafe')
          },
        },
        { shallow },
      ).cause,
      undefined,
    )
  })
})

test('Does not parse error.cause if it is an Error instance', (t) => {
  const cause = new Error('test')
  const error = { ...SIMPLE_ERROR_OBJECT, cause }
  t.is(parse(error).cause, cause)
})

test('Does not parse error.errors if they are Error instances', (t) => {
  const errors = [new Error('test')]
  const error = { ...SIMPLE_ERROR_OBJECT, errors }
  t.is(parse(error).errors[0], errors[0])
})

each([true, false], ({ title }, shallow) => {
  test(`Parse deeply or not with "shallow" and "loose" | ${title}`, (t) => {
    const [{ error }] = parse([{ error: SIMPLE_ERROR_OBJECT }], {
      shallow,
      loose: true,
    })
    t.not(error instanceof Error, shallow)
    t.is(error.message, SIMPLE_ERROR_OBJECT.message)
  })
})
