import test from 'ava'
import { serialize } from 'error-serializer'
import { each } from 'test-each'

test('constructorArgs can be set', (t) => {
  const error = new Error('test')
  error.constructorArgs = [true]
  t.deepEqual(serialize(error).constructorArgs, [true])
})

test('constructorArgs can be non-enumerable', (t) => {
  const error = new Error('test')
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'constructorArgs', {
    value: [true],
    enumerable: false,
    writable: true,
    configurable: true,
  })
  const newError = serialize(error)
  t.deepEqual(newError.constructorArgs, [true])
  t.true(
    Object.getOwnPropertyDescriptor(newError, 'constructorArgs').enumerable,
  )
})

const getArguments = function () {
  // eslint-disable-next-line fp/no-arguments, prefer-rest-params
  return arguments
}

test('constructorArgs cannot be "arguments"', (t) => {
  const error = new Error('test')
  error.constructorArgs = getArguments(true)
  t.false('constructorArgs' in serialize(error))
})

each(
  [
    { beforePack: ['test'], afterPack: undefined },
    { beforePack: ['test', {}], afterPack: undefined },
    { beforePack: ['other'], afterPack: ['other'] },
    { beforePack: ['other', {}], afterPack: ['other', {}] },
    // eslint-disable-next-line unicorn/no-null
    ...[true, null, { test: true }].map((secondArg) => ({
      beforePack: ['test', secondArg],
      // eslint-disable-next-line unicorn/no-null
      afterPack: [null, secondArg],
    })),
  ],
  ({ title }, { beforePack, afterPack }) => {
    test(`constructorArgs packs messages | ${title}`, (t) => {
      const error = new Error('test')
      error.constructorArgs = beforePack
      t.deepEqual(serialize(error).constructorArgs, afterPack)
    })
  },
)
