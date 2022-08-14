import { expectType, expectAssignable, expectNotAssignable } from 'tsd'

import { serialize, parse, ParseOptions, ErrorObject } from './main.js'

const error = new Error('test')

expectType<ErrorObject>(serialize(error))
serialize(null)
serialize({})

const name = 'Error'
const message = 'test'
const stack = 'testStack'
expectAssignable<ErrorObject>({ name, message, stack })
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

expectType<Error>(parse({}))
parse(null)
parse(error)

parse({}, {})
expectAssignable<ParseOptions>({})
expectNotAssignable<ParseOptions>({ unknown: true })
expectAssignable<ParseOptions>({ types: {} })
expectNotAssignable<ParseOptions>({ types: true })
expectNotAssignable<ParseOptions>({ types: { [Symbol()]: true } })
expectAssignable<ParseOptions>({ types: { Error } })
expectNotAssignable<ParseOptions>({ types: { Error: true } })
expectNotAssignable<ParseOptions>({ types: { Error: () => true } })
