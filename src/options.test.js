import test from 'ava'
import { each } from 'test-each'

import { parse, serialize, validateOptions } from 'error-serializer'

each(
  [
    true,
    { loose: 'true' },
    { shallow: 'true' },
    { include: true },
    { include: [true] },
    { include: [Symbol('test')] },
    { exclude: true },
    { exclude: [true] },
    { exclude: [Symbol('test')] },
    { transformObject: true },
    { transformInstance: true },
    { classes: true },
    { classes: { CustomError: true } },
    { classes: { CustomError: () => {} } },
  ],
  [serialize, parse],
  ({ title }, options, func) => {
    test(`Validate options | ${title}`, (t) => {
      t.throws(func.bind(undefined, '', options))
    })

    test(`Export validateOptions() | ${title}`, (t) => {
      t.throws(validateOptions.bind(undefined, options))
    })
  },
)
