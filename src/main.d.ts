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
   *
   * @default false
   *
   * @example
   * ```js
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
 * const errorString = JSON.serialize(errorObject)
 * const newErrorObject = JSON.parse(errorString)
 *
 * const newError = parse(newErrorObject)
 * // Error instance: 'TypeError: example ...'
 * ```
 */
export function serialize<ArgType, Options extends SerializeOptions>(
  errorInstance: ArgType,
  options?: Options,
): Options['loose'] extends true
  ? ArgType extends Error
    ? ErrorObject
    : ArgType
  : ErrorObject

/**
 * `error-serializer` `parse()` options
 */
export interface ParseOptions {
  /**
   *
   * @default false
   *
   * @example
   * ```js
   * ```
   */
  readonly loose?: boolean

  /**
   * Custom error types to keep when parsing.
   *
   *  - Each key is an `errorObject.name`.
   *  - Each value is the error type to use.
   *    The constructor will be called with a single `message` argument.
   *    It it throws, `Error` will be used as the error type instead.
   *
   * @example
   * ```js
   * const errorObject = serialize(new CustomError('example'))
   * // `CustomError` type is kept
   * const error = parse(errorObject, { types: { CustomError } })
   * // Map `CustomError` to another type
   * const otherError = parse(errorObject, { types: { CustomError: TypeError } })
   * ```
   */
  readonly types?: {
    [ErrorType: string]: typeof Error
    [_: symbol | number]: never
  }
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
 * const errorString = JSON.serialize(errorObject)
 * const newErrorObject = JSON.parse(errorString)
 *
 * const newError = parse(newErrorObject)
 * // Error instance: 'TypeError: example ...'
 * ```
 */
export function parse<ArgType, Options extends ParseOptions>(
  errorObject: ArgType,
  options?: Options,
): Options['loose'] extends true
  ? ArgType extends MinimalErrorObject
    ? Error
    : ArgType
  : Error
