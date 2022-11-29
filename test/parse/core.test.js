import test from 'ava'
import { parse } from 'error-serializer'
import { each } from 'test-each'

import { SIMPLE_ERROR_OBJECT } from '../helpers/main.js'

each(
  [
    { propName: 'name', value: 'TypeError' },
    { propName: 'message', value: 'test' },
    { propName: 'stack', value: new Error('undefined').stack },
    { propName: 'lineNumber', value: 0 },
    { propName: 'columnNumber', value: 0 },
    { propName: 'fileName', value: 'file.js' },
  ],
  ({ title }, { propName, value }) => {
    test(`Core error properties are set | ${title}`, (t) => {
      const error = parse({ ...SIMPLE_ERROR_OBJECT, [propName]: value })
      t.is(error[propName], value)
    })

    test(`Core error properties are not enumerable | ${title}`, (t) => {
      const error = parse({ ...SIMPLE_ERROR_OBJECT, [propName]: value })
      t.is({ ...error }[propName], undefined)
    })
  },
)
