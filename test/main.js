import test from 'ava'
import { serialize } from 'error-serializer'
import { each } from 'test-each'

each(
  // eslint-disable-next-line unicorn/no-null
  [undefined, null, 'message', { message: 'test' }, []],
  ({ title }, value) => {
    test(`Allow any type to be serialized | ${title}`, (t) => {
      t.is(typeof serialize(value).message, 'string')
    })
  },
)
