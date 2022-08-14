import { expectType } from 'tsd'

import { serialize, parse, ParseOptions, ErrorObject } from './main.js'

expectType<ErrorObject>(serialize({}))
