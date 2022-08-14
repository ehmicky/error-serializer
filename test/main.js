import test from 'ava'
import { serialize } from 'error-serializer'

test('Serializes error name', (t) => {
  t.is(serialize(new Error('test')).name, 'Error')
})
