import test from 'ava'
import { each } from 'test-each'

import { serialize, parse, validateOptions } from 'error-serializer'

each(
  [
    true,
    { loose: 'true' },
    { shallow: 'true' },
    { beforeSerialize: true },
    { afterSerialize: true },
    { beforeParse: true },
    { afterParse: true },
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
