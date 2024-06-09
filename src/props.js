import { listSafeKeys } from './check.js'

// `new Error()` already defines some properties, that we don't need to
// redefine.
// This ensure we don't redefine `error.name` so it matches its constructor
export const SET_CORE_PROPS = new Set(['name', 'message'])

export const NON_ENUMERABLE_PROPS = new Set([
  'name',
  'message',
  'stack',
  'cause',
  'errors',
  'lineNumber',
  'columnNumber',
  'fileName',
])

// When serializing, we exclude non-core error properties that either:
//  - Are non-enumerable
//     - Reason: most likely not meant to be serialized
//  - Are inherited
//     - They cannot be parsed back as inherited
//     - If the same Error class is used during parsing, they are kept anyway
//  - Have symbol keys
//     - Reason: not supported by JSON
// When parsing, we do the same since JSON should only have enumerable, own,
// non-symbol keys.
export const listProps = (objectOrError) => {
  const propNames = Object.keys(objectOrError).filter(isNotIgnoredProp)
  const propNamesA = [...new Set([...propNames, ...CORE_PROPS])]
  return listSafeKeys(objectOrError, propNamesA).filter(
    (propName) => objectOrError[propName] !== undefined,
  )
}

const isNotIgnoredProp = (propName) => !IGNORED_PROPS.has(propName)

// We ignore `error.toJSON()` to ensure the plain object can be parsed back
const IGNORED_PROPS = new Set(['toJSON', 'constructorArgs'])

// Core properties are serialized/parsed even if inherited or enumerable
const CORE_PROPS = [...NON_ENUMERABLE_PROPS, 'line', 'column']
