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

/**
 * Error instance converted to a plain object
 */
export interface ErrorObject {
  name: string
  message: string
  stack: string
  cause?: ErrorObject
  errors?: ErrorObject[]
  [key: PropertyKey]: JSONValue
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
export function serialize(errorInstance: unknown): ErrorObject

/**
 * `error-serializer` `parse()` options
 */
export interface ParseOptions {
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
export function parse(errorObject: unknown, options?: ParseOptions): Error
