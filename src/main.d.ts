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
   * Unless this option is `true`, nested errors are also serialized.
   * They can be inside other errors, plain objects or arrays.
   *
   * @default false
   *
   * @example
   * ```js
   * console.log(serialize([{ error: new Error('test') }]))
   * // [{ error: { name: 'Error', ... } }]
   * console.log(serialize([{ error: new Error('test') }], { shallow: true }))
   * // [{ error: Error }]
   * ```
   */
  readonly shallow?: boolean

  /**
   * Convert `errorInstance` to an `Error` instance if it is not one.
   *
   * @default false
   *
   * @example
   * ```js
   * console.log(serialize('example')) // 'example'
   * console.log(serialize('example', { normalize: true })) // { name: 'Error', message: 'example', ... }
   * ```
   */
  readonly normalize?: boolean
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
export function serialize<Value, Options extends SerializeOptions = {}>(
  errorInstance: Value,
  options?: Options,
): Options['shallow'] extends true
  ? SerializeShallow<SerializeNormalize<Value, Options>>
  : SerializeDeep<SerializeNormalize<Value, Options>>

type SerializeNormalize<
  Argument,
  Options extends SerializeOptions,
> = Options['normalize'] extends true
  ? Argument extends Error
    ? Argument
    : Error
  : Argument

type SerializeShallow<Value> = Value extends Error
  ? ErrorObject & {
      [Key in keyof Value as Value[Key] extends ErrorObject[Key]
        ? Key
        : never]: Value[Key]
    }
  : Value

type SerializeDeep<Value> = Value extends Error
  ? ErrorObject & {
      [Key in keyof Value as SerializeDeep<Value[Key]> extends ErrorObject[Key]
        ? Key
        : never]: SerializeDeep<Value[Key]>
    }
  : Value extends object
  ? { [Key in keyof Value]: SerializeDeep<Value[Key]> }
  : Value

// `Error` is both a `CallableFunction` and a `NewableFunction`, which makes
// `typeof Error` not work as expected.
type ErrorClass = new (message: string) => Error

/**
 * `error-serializer` `parse()` options
 */
export interface ParseOptions {
  /**
   * Unless this option is `true`, nested error plain objects are also parsed.
   *
   * @default false
   *
   * @example
   * ```js
   * const errorObject = serialize(new Error('test'))
   *
   * console.log(parse([{ error: errorObject }]))
   * // [{ error: Error }]
   * console.log(parse([{ error: errorObject }], { shallow: true }))
   * // [{ error: { name: 'Error', ... } }]
   * ```
   */
  readonly shallow?: boolean

  /**
   * Convert `errorObject` to an error plain object if it is not one.
   *
   * @default false
   *
   * @example
   * ```js
   * console.log(parse('example')) // 'example'
   * console.log(parse('example', { normalize: true })) // Error: example
   * ```
   */
  readonly normalize?: boolean

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
  : Options['normalize'] extends true
  ? Error
  : Argument
