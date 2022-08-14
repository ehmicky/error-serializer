import { expectType, expectAssignable } from 'tsd'

import errorSerializer, { Options } from './main.js'

expectType<object>(errorSerializer(true))

errorSerializer(true, {})
expectAssignable<Options>({})
