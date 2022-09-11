/**
 * Any JSON value.
 */
type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue }

interface MinimalErrorObject {
  name: string
  message: string
  stack: string
  [key: PropertyKey]: JSONValue
}

/**
 * Error instance converted to a plain object
 */
export interface ErrorObject extends MinimalErrorObject {
  cause?: ErrorObject
  errors?: ErrorObject[]
}

/**
 * `error-serializer` `serialize()` options
 */
export interface SerializeOptions {
  /**
   * If this option is `true` and `errorInstance` is not an `Error` instance,
   * it is returned as is, instead of being converted to a plain object.
   *
   * @default false
   *
   * @example
   * ```js
   * console.log(serialize('example')) // { name: 'Error', message: 'example', ... }
   * console.log(serialize('example', { loose: true })) // 'example'
   * ```
   */
  readonly loose?: boolean
}

/**
 * Convert an `Error` instance into a plain object.
 *
 * @example
 * ```js
 * const error = new TypeError('example')
 * const errorObject = serialize(error)
 * // Plain object: { name: 'TypeError', message: 'example', stack: '...' }
 *
 * const errorString = JSON.stringify(errorObject)
 * const newErrorObject = JSON.parse(errorString)
 *
 * const newError = parse(newErrorObject)
 * // Error instance: 'TypeError: example ...'
 * ```
 */
export function serialize<Argument, Options extends SerializeOptions = {}>(
  errorInstance: Argument,
  options?: Options,
): Argument extends Error
  ? ErrorObject & { name: Argument['name'] }
  : Options['loose'] extends true
  ? Argument
  : ErrorObject

// `Error` is both a `CallableFunction` and a `NewableFunction`, which makes
// `typeof Error` not work as expected.
type ErrorClass = new (message: string) => Error

/**
 * `error-serializer` `parse()` options
 */
export interface ParseOptions {
  /**
   * If this option is `true` and `errorObject` is not an error plain object,
   * it is returned as is, instead of being converted to an `Error` instance.
   *
   * @default false
   *
   * @example
   * ```js
   * console.log(parse('example')) // Error: example
   * console.log(parse('example', { loose: true })) // 'example'
   * ```
   */
  readonly loose?: boolean

  /**
   * Custom error classes to keep when parsing.
   *
   *  - Each key is an `errorObject.name`.
   *  - Each value is the error class to use.
   *    The constructor will be called with a single `message` argument.
   *    It it throws, `Error` will be used as the error class instead.
   *
   * @example
   * ```js
   * const errorObject = serialize(new CustomError('example'))
   * // `CustomError` class is kept
   * const error = parse(errorObject, { classes: { CustomError } })
   * // Map `CustomError` to another class
   * const otherError = parse(errorObject, { classes: { CustomError: TypeError } })
   * ```
   */
  readonly classes?: { [ErrorClassName: string]: ErrorClass }
}

/**
 * Convert an error plain object into an `Error` instance.
 *
 * @example
 * ```js
 * const error = new TypeError('example')
 * const errorObject = serialize(error)
 * // Plain object: { name: 'TypeError', message: 'example', stack: '...' }
 *
 * const errorString = JSON.stringify(errorObject)
 * const newErrorObject = JSON.parse(errorString)
 *
 * const newError = parse(newErrorObject)
 * // Error instance: 'TypeError: example ...'
 * ```
 */
export function parse<Argument, Options extends ParseOptions = {}>(
  errorObject: Argument,
  options?: Options,
): Argument extends MinimalErrorObject
  ? NonNullable<Options['classes']>[Argument['name']] extends ErrorClass
    ? InstanceType<NonNullable<Options['classes']>[Argument['name']]>
    : Error
  : Options['loose'] extends true
  ? Argument
  : Error
