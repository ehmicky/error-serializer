import {
  expectType,
  expectNotType,
  expectAssignable,
  expectNotAssignable,
  expectError,
} from 'tsd'

import {
  serialize,
  parse,
  ParseOptions,
  SerializeOptions,
  ErrorObject,
} from './main.js'

const error = new Error('test')

expectAssignable<ErrorObject>(serialize(error))
expectType<null>(serialize(null))
expectType<{}>(serialize({}))

const name = 'Error'
const message = 'test'
const stack = 'testStack'
expectAssignable<ErrorObject>({ name, message, stack })
expectAssignable<ErrorObject>(serialize({ name, message, stack }))
expectAssignable<ErrorObject>({
  name,
  message,
  stack,
  cause: { name, message, stack },
})
expectAssignable<ErrorObject>({
  name,
  message,
  stack,
  errors: [{ name, message, stack }],
})
expectNotAssignable<ErrorObject>({ name, message })
expectNotAssignable<ErrorObject>({ name, stack })
expectNotAssignable<ErrorObject>({ message, stack })
expectNotAssignable<ErrorObject>({
  name,
  message,
  stack,
  cause: { name, message },
})
expectNotAssignable<ErrorObject>({
  name,
  message,
  stack,
  errors: [{ name, message }],
})
expectNotAssignable<ErrorObject>({ name: true, message, stack })
expectNotAssignable<ErrorObject>({ name, message: true, stack })
expectNotAssignable<ErrorObject>({ name, message, stack: true })
expectNotAssignable<ErrorObject>({
  name,
  message,
  stack,
  cause: { name: true, message, stack },
})
expectNotAssignable<ErrorObject>({
  name,
  message,
  stack,
  errors: [{ name: true, message, stack }],
})
expectAssignable<ErrorObject>({ name, message, stack, prop: true })
expectAssignable<ErrorObject>({ name, message, stack, prop: { one: true } })
expectNotAssignable<ErrorObject>({ name, message, stack, prop: 0n })
expectNotAssignable<ErrorObject>({ name, message, stack, prop: { one: 0n } })

expectType<Error>(parse({}, { normalize: true }))
expectType<null>(parse(null))
expectType<{}>(parse({}))
expectType<typeof error>(error)

serialize({}, {})
expectError(serialize({}, true))
expectAssignable<SerializeOptions>({})
expectNotAssignable<SerializeOptions>({ unknown: true })
expectAssignable<SerializeOptions>({ normalize: false })
expectNotAssignable<SerializeOptions>({ normalize: 'true' })
expectAssignable<SerializeOptions>({ shallow: false })
expectNotAssignable<SerializeOptions>({ shallow: 'true' })

parse({}, {})
expectError(parse({}, true))
expectAssignable<ParseOptions>({})
expectNotAssignable<ParseOptions>({ unknown: true })

expectAssignable<ParseOptions>({ shallow: false })
expectNotAssignable<ParseOptions>({ shallow: 'true' })

expectAssignable<ParseOptions>({ normalize: false })
expectNotAssignable<ParseOptions>({ normalize: 'true' })
expectType<true>(serialize(true))
expectType<true>(serialize(true, { normalize: false }))
expectType<ErrorObject>(serialize(true, { normalize: true }))
expectType<true>(parse(true))
expectType<true>(parse(true, { normalize: false }))
expectType<Error>(parse(true, { normalize: true }))

expectNotType<Error>(parse({ name: '', message: '' }))
expectType<Error>(parse({ name: '', message: '', stack: '' }))

class TestError extends Error {
  name: 'TestError' = 'TestError'
}

expectAssignable<ParseOptions>({ classes: {} })
expectNotAssignable<ParseOptions>({ classes: true })
expectAssignable<ParseOptions>({ classes: { Error } })
expectAssignable<ParseOptions>({ classes: { TestError } })
expectNotAssignable<ParseOptions>({ classes: { Error: true } })
expectNotAssignable<ParseOptions>({ classes: { Error: () => true } })

const testError = new TestError('test')
expectType<'TestError'>(serialize(testError).name)

const errorObject = { name: 'TestError' as const, message: '', stack: '' }
expectType<Error>(parse(errorObject))
expectType<Error>(parse(errorObject, {}))
expectType<Error>(parse(errorObject, { classes: {} }))
expectNotType<TestError>(parse(errorObject, { classes: {} }))
expectType<TestError>(parse(errorObject, { classes: { TestError } }))

const newTestError = serialize(errorObject)
expectType<'TestError'>(newTestError.name)
