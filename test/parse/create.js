import test from 'ava'
import { parse } from 'error-serializer'

test('Default to Error type', (t) => {
  t.is(parse().name, 'Error')
})
