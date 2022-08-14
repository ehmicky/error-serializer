import test from 'ava'
import errorSerializer from 'error-serializer'

test('Dummy test', (t) => {
  t.true(errorSerializer(true))
})
