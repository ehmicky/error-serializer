import {
  expectType,
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
} from 'error-serializer'

class TestError extends Error {
  name: 'TestError' = 'TestError'
  other: true = true
}
const classes = { TestError }
const error = new Error('test') as Error & { name: 'TestError' }

const name = 'TestError' as const
const message = 'test' as const
const stack = 'testStack' as const
const errorObject = { name, message, stack }

expectAssignable<ErrorObject>(serialize(error))
expectType<null>(serialize(null))
expectType<{}>(serialize({}))

expectAssignable<Error>(parse(errorObject, { normalize: true }))
expectType<null>(parse(null))
expectType<{}>(parse({}))

expectAssignable<ErrorObject>(errorObject)
expectAssignable<ErrorObject>(serialize(errorObject))
expectAssignable<ErrorObject>({ ...errorObject, cause: errorObject })
expectAssignable<ErrorObject>({ ...errorObject, errors: [errorObject] })
expectNotAssignable<ErrorObject>({ ...errorObject, name: undefined })
expectNotAssignable<ErrorObject>({ ...errorObject, name: true })
expectNotAssignable<ErrorObject>({ ...errorObject, message: undefined })
expectNotAssignable<ErrorObject>({ ...errorObject, message: true })
expectNotAssignable<ErrorObject>({ ...errorObject, stack: undefined })
expectNotAssignable<ErrorObject>({ ...errorObject, stack: true })
expectNotAssignable<ErrorObject>({
  ...errorObject,
  cause: { ...errorObject, name: undefined },
})
expectNotAssignable<ErrorObject>({
  ...errorObject,
  cause: { ...errorObject, name: true },
})
expectNotAssignable<ErrorObject>({
  ...errorObject,
  errors: [{ ...errorObject, name: undefined }],
})
expectNotAssignable<ErrorObject>({
  ...errorObject,
  errors: [{ ...errorObject, name: true }],
})
expectAssignable<ErrorObject>({ ...errorObject, prop: true })
expectAssignable<ErrorObject>({ ...errorObject, prop: { one: true } })
expectNotAssignable<ErrorObject>({ ...errorObject, prop: 0n })
expectNotAssignable<ErrorObject>({ ...errorObject, prop: { one: 0n } })

expectNotAssignable<Error>(parse({ name: '' }))
expectAssignable<Error>(parse({ name: '', message: '', stack: '' }))

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
expectAssignable<ErrorObject>(serialize(error))
expectAssignable<ErrorObject>(serialize(error, { shallow: true }))
expectAssignable<ErrorObject>(serialize({ error }).error)
expectNotAssignable<ErrorObject>(serialize({ error }, { shallow: true }).error)
expectAssignable<ErrorObject>(serialize([error] as const)[0])
expectNotAssignable<ErrorObject>(
  serialize([error] as const, { shallow: true })[0],
)
expectType<'TestError'>(serialize(error).name)
expectType<'TestError'>(serialize(error, { shallow: true }).name)
expectType<'TestError'>(serialize(errorObject).name)
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

expectAssignable<ParseOptions>({ shallow: false })
expectNotAssignable<ParseOptions>({ shallow: 'true' })
expectAssignable<Error>(parse(errorObject))
expectAssignable<Error>(parse(errorObject, { shallow: true }))
expectAssignable<TestError>(parse(errorObject, { classes }))
expectAssignable<TestError>(parse(errorObject, { shallow: true, classes }))
expectAssignable<TestError>(parse({ errorObject }, { classes }).errorObject)
expectNotAssignable<TestError>(
  parse({ errorObject }, { shallow: true, classes }).errorObject,
)
expectAssignable<TestError>(parse([errorObject] as const, { classes })[0])
expectNotAssignable<TestError>(
  parse([errorObject] as const, { shallow: true, classes })[0],
)
expectType<'TestError'>(parse(errorObject).name)
expectType<'TestError'>(parse(errorObject, { shallow: true }).name)
expectAssignable<true>(parse({ ...errorObject, prop: true as const }).prop)
expectAssignable<true>(
  parse({ ...errorObject, prop: true as const }, { shallow: true }).prop,
)
expectAssignable<TestError>(
  parse({ ...errorObject, prop: errorObject }, { classes }).prop,
)
expectNotAssignable<TestError>(
  parse({ ...errorObject, prop: errorObject }, { shallow: true, classes }).prop,
)
expectAssignable<TestError>(
  parse({ ...errorObject, cause: errorObject }, { classes }).cause,
)
expectNotAssignable<TestError>(
  parse({ ...errorObject, cause: errorObject }, { shallow: true, classes })
    .cause,
)

expectAssignable<SerializeOptions>({ normalize: false })
expectNotAssignable<SerializeOptions>({ normalize: 'true' })
expectType<true>(serialize(true))
expectType<true>(serialize(true, { normalize: false }))
expectAssignable<ErrorObject>(serialize(true, { normalize: true }))
expectType<'TestError'>(serialize(error, { normalize: true }).name)

expectNotAssignable<SerializeOptions>({ beforeSerialize: false })
expectNotAssignable<SerializeOptions>({
  beforeSerialize(error: boolean) {},
})
expectNotAssignable<SerializeOptions>({
  beforeSerialize(error: Error, extra: boolean) {},
})
expectAssignable<SerializeOptions>({ beforeSerialize() {} })
expectAssignable<SerializeOptions>({ beforeSerialize(error: Error) {} })
expectAssignable<SerializeOptions>({
  beforeSerialize(error: Error) {
    return true
  },
})

expectNotAssignable<SerializeOptions>({ afterSerialize: false })
expectNotAssignable<SerializeOptions>({
  afterSerialize(error: boolean) {},
})
expectNotAssignable<SerializeOptions>({
  afterSerialize(error: Error, errorObject: ErrorObject, extra: boolean) {},
})
expectAssignable<SerializeOptions>({ afterSerialize() {} })
expectAssignable<SerializeOptions>({ afterSerialize(error: Error) {} })
expectAssignable<SerializeOptions>({
  afterSerialize(error: Error, errorObject: ErrorObject) {},
})
expectAssignable<SerializeOptions>({
  afterSerialize(error: Error, errorObject: ErrorObject) {
    return true
  },
})

expectNotAssignable<ParseOptions>({ beforeParse: false })
expectNotAssignable<ParseOptions>({
  beforeParse(errorObject: boolean) {},
})
expectNotAssignable<ParseOptions>({
  beforeParse(errorObject: ErrorObject, extra: boolean) {},
})
expectAssignable<ParseOptions>({ beforeParse() {} })
expectAssignable<ParseOptions>({ beforeParse(errorObject: ErrorObject) {} })
expectAssignable<ParseOptions>({
  beforeParse(errorObject: ErrorObject) {
    return true
  },
})

expectNotAssignable<ParseOptions>({ afterParse: false })
expectNotAssignable<ParseOptions>({
  afterParse(errorObject: boolean) {},
})
expectNotAssignable<ParseOptions>({
  afterParse(errorObject: ErrorObject, error: Error, extra: boolean) {},
})
expectAssignable<ParseOptions>({ afterParse() {} })
expectAssignable<ParseOptions>({
  afterParse(errorObject: ErrorObject, error: Error) {},
})
expectAssignable<ParseOptions>({
  afterParse(errorObject: ErrorObject, error: Error) {
    return true
  },
})

expectAssignable<ParseOptions>({ normalize: false })
expectNotAssignable<ParseOptions>({ normalize: 'true' })
expectType<true>(parse(true))
expectType<true>(parse(true, { normalize: false }))
expectType<Error>(parse(true, { normalize: true }))
expectType<'TestError'>(parse(errorObject, { normalize: true }).name)

expectAssignable<ParseOptions>({ classes: {} })
expectNotAssignable<ParseOptions>({ classes: true })
expectAssignable<ParseOptions>({ classes: { Error } })
expectAssignable<ParseOptions>({ classes })
expectNotAssignable<ParseOptions>({ classes: { Error: true } })
expectNotAssignable<ParseOptions>({ classes: { Error: () => true } })
expectAssignable<Error>(parse(errorObject))
expectAssignable<Error>(parse(errorObject, {}))
expectAssignable<Error>(parse(errorObject, { classes: {} }))
expectNotAssignable<TestError>(parse(errorObject, { classes: {} }))
expectAssignable<TestError>(parse(errorObject, { classes }))
