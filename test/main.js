import test from 'ava'
import { parse } from 'error-serializer'

test('Dummy test', (t) => {
  t.is(typeof parse, 'function')
})
