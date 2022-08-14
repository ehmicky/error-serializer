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
 *
 */
export interface ErrorObject {
  /**
   *
   */
  name: string

  /**
   *
   */
  message: string

  /**
   *
   */
  stack: string

  /**
   *
   */
  cause?: ErrorObject

  /**
   *
   */
  errors?: ErrorObject[]

  /**
   *
   */
  [key: PropertyKey]: JSONValue
}

/**
 *
 * @example
 * ```js
 * ```
 */
export function serialize(error: unknown): ErrorObject

/**
 * `error-serializer` `parse()` options
 */
export interface ParseOptions {
  readonly types?: {
    [ErrorType: string]: typeof Error
  }
}

/**
 *
 * @example
 * ```js
 * ```
 */
export function parse(errorObject: unknown, options?: ParseOptions): Error
