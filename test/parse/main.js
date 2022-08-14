import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

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
  t.true(error.cause instanceof Error)
  t.is(error.cause.message, message)
  t.is({ ...error }.cause, undefined)
})

test('Aggregate errors are set', (t) => {
  const message = 'test'
  const error = parse({
    ...SIMPLE_ERROR_OBJECT,
    errors: [{ ...SIMPLE_ERROR_OBJECT, message }],
  })
  t.true(error.errors[0] instanceof Error)
  t.is(error.errors[0].message, message)
  t.is({ ...error }.errors, undefined)
})
