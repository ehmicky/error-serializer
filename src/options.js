import isPlainObj from 'is-plain-obj'

// Normalize and validate options
export const normalizeOptions = function (options) {
  validateOptions(options)
  return addDefaultOptions(options)
}

// Exported for `modern-errors-serialize`, but undocumented
export const validateOptions = function (options) {
  if (options === undefined) {
    return
  }

  if (!isPlainObj(options)) {
    throw new TypeError(`Options must be a plain object: ${options}`)
  }

  validateAllOptions(options)
}

const validateAllOptions = function ({
  normalize,
  shallow,
  beforeSerialize,
  afterSerialize,
  beforeParse,
  afterParse,
  classes,
}) {
  validateBoolean(normalize, 'normalize')
  validateBoolean(shallow, 'shallow')
  validateOptionalFunction(beforeSerialize, 'beforeSerialize')
  validateOptionalFunction(afterSerialize, 'afterSerialize')
  validateOptionalFunction(beforeParse, 'beforeParse')
  validateOptionalFunction(afterParse, 'afterParse')
  validateClasses(classes)
}

const validateBoolean = function (value, name) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new TypeError(`Option "${name}" must be a boolean: ${value}`)
  }
}

const validateOptionalFunction = function (value, name) {
  if (value !== undefined && typeof value !== 'function') {
    throw new TypeError(`Option "${name}" must be a function: ${value}`)
  }
}

const validateClasses = function (classes) {
  if (classes === undefined) {
    return
  }

  if (!isPlainObj(classes)) {
    throw new TypeError(`Option "classes" must be a plain object: ${classes}`)
  }

  Object.entries(classes).forEach(validateClass)
}

const validateClass = function ([name, ErrorClass]) {
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

const addDefaultOptions = function ({
  normalize = false,
  shallow = false,
  classes = {},
  beforeSerialize,
  afterSerialize,
  beforeParse,
  afterParse,
} = {}) {
  return {
    normalize,
    shallow,
    classes,
    beforeSerialize,
    afterSerialize,
    beforeParse,
    afterParse,
  }
}
