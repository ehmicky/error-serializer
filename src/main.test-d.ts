import { expectType, expectAssignable, expectNotAssignable } from 'tsd'

import {
  serialize,
  parse,
  type ParseOptions,
  type SerializeOptions,
  type ErrorObject,
} from 'error-serializer'

// eslint-disable-next-line fp/no-class
class TestError extends Error {
  name = 'TestError' as const
  other = true as const
}
const classes = { TestError }
const error = new Error('test') as Error & { name: 'TestError' }

const name = 'TestError' as const
const message = 'test' as const
const stack = 'testStack' as const
const errorObject = { name, message, stack }

expectAssignable<ErrorObject>(serialize(error))

expectAssignable<Error>(parse(errorObject))

expectAssignable<ErrorObject>(errorObject)
expectAssignable<ErrorObject>(serialize(errorObject, { loose: true }))
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

expectNotAssignable<Error>(parse({ name: '' }, { loose: true }))
expectAssignable<Error>(
  parse({ name: '', message: '', stack: '' }, { loose: true }),
)

serialize(error, {})
// @ts-expect-error
serialize(error, true)
expectAssignable<SerializeOptions>({})
expectNotAssignable<SerializeOptions>({ unknown: true })

parse(errorObject, {})
// @ts-expect-error
parse(errorObject, true)
expectAssignable<ParseOptions>({})
expectNotAssignable<ParseOptions>({ unknown: true })

expectAssignable<SerializeOptions>({ shallow: false })
expectNotAssignable<SerializeOptions>({ shallow: 'true' })
expectAssignable<ErrorObject>(serialize(error))
expectAssignable<ErrorObject>(serialize(error, { shallow: true }))
expectAssignable<ErrorObject>(serialize({ error }, { loose: true }).error)
expectNotAssignable<ErrorObject>(
  serialize({ error }, { loose: true, shallow: true }).error,
)
expectAssignable<ErrorObject>(serialize([error] as const, { loose: true })[0])
expectNotAssignable<ErrorObject>(
  serialize([error] as const, { loose: true, shallow: true })[0],
)
expectType<'TestError'>(serialize(error).name)
expectType<'TestError'>(serialize(error, { shallow: true }).name)
expectType<'TestError'>(serialize(errorObject, { loose: true }).name)
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
expectAssignable<TestError>(
  parse({ errorObject }, { classes, loose: true }).errorObject,
)
expectNotAssignable<TestError>(
  parse({ errorObject }, { loose: true, shallow: true, classes }).errorObject,
)
expectAssignable<TestError>(
  parse([errorObject] as const, { classes, loose: true })[0],
)
expectNotAssignable<TestError>(
  parse([errorObject] as const, { loose: true, shallow: true, classes })[0],
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

expectAssignable<SerializeOptions>({ loose: true })
expectNotAssignable<SerializeOptions>({ loose: 'true' })
expectType<true>(serialize(true, { loose: true }))
expectAssignable<ErrorObject>(serialize(true))
expectAssignable<ErrorObject>(serialize(true, { loose: false }))
expectType<'TestError'>(serialize(error).name)

expectNotAssignable<SerializeOptions>({ beforeSerialize: false })
expectNotAssignable<SerializeOptions>({
  beforeSerialize(errorArg: boolean) {},
})
expectNotAssignable<SerializeOptions>({
  beforeSerialize(errorArg: Error, extra: boolean) {},
})
expectAssignable<SerializeOptions>({ beforeSerialize() {} })
expectAssignable<SerializeOptions>({ beforeSerialize(errorArg: Error) {} })
expectAssignable<SerializeOptions>({
  beforeSerialize(errorArg: Error) {
    return true
  },
})

expectNotAssignable<SerializeOptions>({ afterSerialize: false })
expectNotAssignable<SerializeOptions>({
  afterSerialize(errorArg: boolean) {},
})
expectNotAssignable<SerializeOptions>({
  afterSerialize(
    errorArg: Error,
    errorObjectArg: ErrorObject,
    extra: boolean,
  ) {},
})
expectAssignable<SerializeOptions>({ afterSerialize() {} })
expectAssignable<SerializeOptions>({ afterSerialize(errorArg: Error) {} })
expectAssignable<SerializeOptions>({
  afterSerialize(errorArg: Error, errorObjectArg: ErrorObject) {},
})
expectAssignable<SerializeOptions>({
  afterSerialize(errorArg: Error, errorObjectArg: ErrorObject) {
    return true
  },
})

expectNotAssignable<ParseOptions>({ beforeParse: false })
expectNotAssignable<ParseOptions>({
  beforeParse(errorObjectArg: boolean) {},
})
expectNotAssignable<ParseOptions>({
  beforeParse(errorObjectArg: ErrorObject, extra: boolean) {},
})
expectAssignable<ParseOptions>({ beforeParse() {} })
expectAssignable<ParseOptions>({ beforeParse(errorObjectArg: ErrorObject) {} })
expectAssignable<ParseOptions>({
  beforeParse(errorObjectArg: ErrorObject) {
    return true
  },
})

expectNotAssignable<ParseOptions>({ afterParse: false })
expectNotAssignable<ParseOptions>({
  afterParse(errorObjectArg: boolean) {},
})
expectNotAssignable<ParseOptions>({
  afterParse(errorObjectArg: ErrorObject, errorArg: Error, extra: boolean) {},
})
expectAssignable<ParseOptions>({ afterParse() {} })
expectAssignable<ParseOptions>({
  afterParse(errorObjectArg: ErrorObject, errorArg: Error) {},
})
expectAssignable<ParseOptions>({
  afterParse(errorObjectArg: ErrorObject, errorArg: Error) {
    return true
  },
})

expectAssignable<ParseOptions>({ loose: true })
expectNotAssignable<ParseOptions>({ loose: 'true' })
expectType<true>(parse(true, { loose: true }))
expectType<Error>(parse(true))
expectType<Error>(parse(true, { loose: false }))
expectType<'TestError'>(parse(errorObject).name)

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
