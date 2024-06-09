import isPlainObj from 'is-plain-obj'

// Normalize and validate options
export const normalizeOptions = (options) => {
  validateOptions(options)
  return addDefaultOptions(options)
}

// Exported for `modern-errors-serialize`, but undocumented
export const validateOptions = (options) => {
  if (options === undefined) {
    return
  }

  if (!isPlainObj(options)) {
    throw new TypeError(`Options must be a plain object: ${options}`)
  }

  validateAllOptions(options)
}

const validateAllOptions = ({
  loose,
  shallow,
  include,
  exclude,
  transformObject,
  transformArgs,
  transformInstance,
  classes,
}) => {
  validateBoolean(loose, 'loose')
  validateBoolean(shallow, 'shallow')
  validateList(include, 'include')
  validateList(exclude, 'exclude')
  validateOptionalFunction(transformObject, 'transformObject')
  validateOptionalFunction(transformArgs, 'transformArgs')
  validateOptionalFunction(transformInstance, 'transformInstance')
  validateClasses(classes)
}

const validateBoolean = (value, name) => {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new TypeError(`Option "${name}" must be a boolean: ${value}`)
  }
}

const validateList = (value, name) => {
  if (value === undefined) {
    return
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`Option "${name}" must be an array: ${value}`)
  }

  const invalidItem = value.find((item) => typeof item !== 'string')

  if (invalidItem !== undefined) {
    throw new TypeError(
      `Option "${name}" must only contain strings: ${String(invalidItem)}`,
    )
  }
}

const validateOptionalFunction = (value, name) => {
  if (value !== undefined && typeof value !== 'function') {
    throw new TypeError(`Option "${name}" must be a function: ${value}`)
  }
}

const validateClasses = (classes) => {
  if (classes === undefined) {
    return
  }

  if (!isPlainObj(classes)) {
    throw new TypeError(`Option "classes" must be a plain object: ${classes}`)
  }

  Object.entries(classes).forEach(validateClass)
}

const validateClass = ([name, ErrorClass]) => {
  if (ErrorClass === undefined) {
    return
  }

  if (typeof ErrorClass !== 'function') {
    throw new TypeError(
      `Option "classes.${name}" must be a function: ${ErrorClass}`,
    )
  }

  if (!isProto.call(Error, ErrorClass)) {
    throw new TypeError(
      `Option "classes.${name}" must be an error class: ${ErrorClass}`,
    )
  }
}

const { isPrototypeOf: isProto } = Object.prototype

const addDefaultOptions = ({
  loose = false,
  shallow = false,
  classes = {},
  ...otherOptions
} = {}) => ({ ...otherOptions, loose, shallow, classes })
