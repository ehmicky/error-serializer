import { REQUIRED_PROPERTY } from './check.js'
import { listProps } from './props.js'

// Apply `include` and `exclude` options during `serialize()`
export const applyList = (errorObject, { include, exclude }) => {
  if (include === undefined && exclude === undefined) {
    return errorObject
  }

  const propNames = listProps(errorObject)
  const propNamesA = applyInclude(propNames, include)
  const propNamesB = applyExclude(propNamesA, exclude)
  return Object.fromEntries(
    propNamesB.map((propName) => [propName, errorObject[propName]]),
  )
}

const applyInclude = (propNames, include) => {
  if (include === undefined) {
    return propNames
  }

  // TODO: use Set.intersection() after dropping support for Node <22.0.0
  const includedProps = new Set([...include, REQUIRED_PROPERTY])
  return propNames.filter((propName) => includedProps.has(propName))
}

const applyExclude = (propNames, exclude) => {
  if (exclude === undefined) {
    return propNames
  }

  // TODO: use Set.difference() after dropping support for Node <22.0.0
  const excludedProps = new Set(
    exclude.filter((propName) => propName !== REQUIRED_PROPERTY),
  )
  return propNames.filter((propName) => !excludedProps.has(propName))
}
