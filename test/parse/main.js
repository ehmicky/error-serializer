import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

each(
  [
    { propName: 'name', value: 'TypeError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('undefined').stack },
  ],
  ({ title }, { propName, value }) => {
    test(`Core error properties are set | ${title}`, (t) => {
      const error = parse({ name: 'Error', message: '', [propName]: value })
      t.deepEqual(error[propName], value)
      t.is({ ...error }[propName], undefined)
    })
  },
)

test('Cause is set', (t) => {
  const message = 'test'
  const error = parse({ cause: { message } })
  t.true(error.cause instanceof Error)
  t.is(error.cause.message, message)
  t.is({ ...error }.cause, undefined)
})

test('Aggregate errors are set', (t) => {
  const message = 'test'
  const error = parse({ errors: [{ message }] })
  t.true(error.errors[0] instanceof Error)
  t.is(error.errors[0].message, message)
  t.is({ ...error }.errors, undefined)
})

each(['name', 'message', 'stack', 'cause', 'errors'], ({ title }, propName) => {
  test(`Handle unsafe properties | ${title}`, (t) => {
    t.is(
      parse({
        // eslint-disable-next-line fp/no-get-set
        get [propName]() {
          throw new Error('unsafe')
        },
      }).name,
      'Error',
    )
  })
})
