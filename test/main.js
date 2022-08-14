import test from 'ava'
import { serialize } from 'error-serializer'
import { each } from 'test-each'

const normalError = new Error('test')
// eslint-disable-next-line fp/no-mutation
normalError.cause = new Error('inner')
// eslint-disable-next-line fp/no-mutation
normalError.errors = [new Error('otherInner')]

each(['name', 'message', 'stack'], ({ title }, propName) => {
  test(`Serializes error core property | ${title}`, (t) => {
    t.is(serialize(normalError)[propName], normalError[propName])
  })

  test(`Serializes error cause | ${title}`, (t) => {
    t.is(serialize(normalError).cause[propName], normalError.cause[propName])
  })

  test(`Serializes aggregate errors | ${title}`, (t) => {
    t.is(
      serialize(normalError).errors[0][propName],
      normalError.errors[0][propName],
    )
  })
})
