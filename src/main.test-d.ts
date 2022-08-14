import { expectType, expectAssignable } from 'tsd'

import templateName, { Options } from './main.js'

expectType<object>(templateName(true))

templateName(true, {})
expectAssignable<Options>({})
