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

parse({}, {})
expectError(parse({}, true))
expectAssignable<ParseOptions>({})
expectNotAssignable<ParseOptions>({ unknown: true })

expectAssignable<SerializeOptions>({ shallow: false })
expectNotAssignable<SerializeOptions>({ shallow: 'true' })
expectAssignable<ErrorObject>(serialize({} as Error))
expectAssignable<ErrorObject>(serialize({} as Error, { shallow: true }))
expectAssignable<ErrorObject>(serialize({ error: {} as Error }).error)
expectNotAssignable<ErrorObject>(
  serialize({ error: {} as Error }, { shallow: true }).error,
)
expectAssignable<ErrorObject>(serialize([{}] as [Error])[0])
expectNotAssignable<ErrorObject>(
  serialize([{}] as [Error], { shallow: true })[0],
)
expectAssignable<'TestError'>(
  serialize({} as Error & { name: 'TestError' }).name,
)
expectAssignable<'TestError'>(
  serialize({} as Error & { name: 'TestError' }, { shallow: true }).name,
)
expectAssignable<true>(serialize({} as Error & { prop: true }).prop)
expectAssignable<true>(
  serialize({} as Error & { prop: true }, { shallow: true }).prop,
)
expectAssignable<ErrorObject>(serialize({} as Error & { prop: Error }).prop)
expectNotAssignable<ErrorObject>(
  serialize({} as Error & { prop: Error }, { shallow: true }).prop,
)
expectAssignable<ErrorObject>(serialize({} as Error & { cause: Error }).cause)
expectNotAssignable<ErrorObject>(
  serialize({} as Error & { cause: Error }, { shallow: true }).cause,
)

class TestError extends Error {
  name: 'TestError' = 'TestError'
  other: true = true
}

expectAssignable<ParseOptions>({ shallow: false })
expectNotAssignable<ParseOptions>({ shallow: 'true' })
expectAssignable<Error>(parse({ name, message, stack }))
expectAssignable<Error>(parse({ name, message, stack }, { shallow: true }))
expectAssignable<TestError>(
  parse({ name: 'TestError', message, stack }, { classes: { TestError } }),
)
expectNotAssignable<TestError>(
  parse(
    { name: 'TestError', message, stack },
    { shallow: true, classes: { TestError } },
  ),
)

expectAssignable<SerializeOptions>({ normalize: false })
expectNotAssignable<SerializeOptions>({ normalize: 'true' })
expectAssignable<ParseOptions>({ normalize: false })
expectNotAssignable<ParseOptions>({ normalize: 'true' })
expectType<true>(serialize(true))
expectType<true>(serialize(true, { normalize: false }))
expectAssignable<ErrorObject>(serialize(true, { normalize: true }))
expectType<'TestError'>(
  serialize(error as Error & { name: 'TestError' }, { normalize: true }).name,
)
expectType<true>(parse(true))
expectType<true>(parse(true, { normalize: false }))
expectType<Error>(parse(true, { normalize: true }))
expectType<'TestError'>(
  parse({ name: 'TestError' as const, message, stack }, { normalize: true })
    .name,
)

expectNotAssignable<Error>(parse({ name: '' }))
expectAssignable<Error>(parse({ name: '', message: '', stack: '' }))

expectAssignable<ParseOptions>({ classes: {} })
expectNotAssignable<ParseOptions>({ classes: true })
expectAssignable<ParseOptions>({ classes: { Error } })
expectAssignable<ParseOptions>({ classes: { TestError } })
expectNotAssignable<ParseOptions>({ classes: { Error: true } })
expectNotAssignable<ParseOptions>({ classes: { Error: () => true } })

const testError = new TestError('test')
expectType<'TestError'>(serialize(testError).name)

const errorObject = { name: 'TestError' as const, message: '', stack: '' }
expectAssignable<Error>(parse(errorObject))
expectAssignable<Error>(parse(errorObject, {}))
expectAssignable<Error>(parse(errorObject, { classes: {} }))
expectNotAssignable<TestError>(parse(errorObject, { classes: {} }))
expectAssignable<TestError>(parse(errorObject, { classes: { TestError } }))

const newTestError = serialize(errorObject)
expectType<'TestError'>(newTestError.name)
