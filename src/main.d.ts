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
  message: string
  [key: PropertyKey]: JSONValue
}

/**
 * Error instance converted to a plain object
 */
export interface ErrorObject extends MinimalErrorObject {
  name: string
  stack: string
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
   * const error = new Error('example')
   * error.inner = new Error('inner')
   * serialize(error).inner // { name: 'Error', message: 'inner', ... }
   * serialize(error, { shallow: true }).inner // Error: inner ...
   * ```
   */
  readonly shallow?: boolean

  /**
   * By default, when the argument is not an `Error` instance, it is converted
   * to one. If this option is `true`, it is kept as is instead.
   *
   * @default false
   *
   * @example
   * ```js
   * serialize('example') // { name: 'Error', message: 'example', ... }
   * serialize('example', { loose: true }) // 'example'
   * ```
   */
  readonly loose?: boolean

  /**
   * Transform each error plain object.
   *
   * `errorObject` is the error after serialization. It must be directly
   * mutated.
   *
   * `errorInstance` is the error before serialization.
   *
   * @example
   * ```js
   * const errors = [new Error('test secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'test ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformObject?: (
    errorObject: ErrorObject,
    errorInstance: Error,
  ) => void
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
  Value,
  Options extends SerializeOptions,
> = Options['loose'] extends true ? Value : Value extends Error ? Value : Error

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
   * They can be inside other errors, plain objects or arrays.
   *
   * @default false
   *
   * @example
   * ```js
   * const error = new Error('example')
   * error.inner = new Error('inner')
   * const errorObject = serialize(error)
   *
   * parse(errorObject).inner // Error: inner ...
   * parse(errorObject, { shallow: true }).inner // { name: 'Error', message: ... }
   * ```
   */
  readonly shallow?: boolean

  /**
   * By default, when the argument is not an error plain object, it is
   * converted to one. If this option is `true`, it is kept as is instead.
   *
   * @default false
   *
   * @example
   * ```js
   * parse('example') // Error: example
   * parse('example', { loose: true }) // 'example'
   * ```
   */
  readonly loose?: boolean

  /**
   * Custom error classes to keep when parsing.
   *
   *  - Each key is an `errorObject.name`
   *  - Each value is the error class to use
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

  /**
   * Transform the arguments passed to each `new Error()`.
   *
   * `constructorArgs` is the array of arguments. Usually, `constructorArgs[0]`
   * is the
   * [error message](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message)
   * and `constructorArgs[1]` is the
   * [constructor options object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error#parameters).
   * `constructorArgs` must be directly mutated.
   *
   * `errorObject` is the error before parsing.
   *
   * @example
   * ```js
   * const errors = [new Error('test secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'test ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformArgs?: (
    constructorArgs: unknown[],
    errorObject: ErrorObject,
    ErrorClass: ErrorClass,
  ) => void

  /**
   * Transform each `Error` instance.
   *
   * `errorInstance` is the error after parsing. It must be directly mutated.
   *
   * `errorObject` is the error before parsing.
   *
   * @example
   * ```js
   * const errors = [new Error('test secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'test ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformInstance?: (
    errorInstance: Error,
    errorObject: ErrorObject,
  ) => void
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
export function parse<Value, Options extends ParseOptions = {}>(
  errorObject: Value,
  options?: Options,
): Options['shallow'] extends true
  ? ParseNormalize<ParseShallow<Value, Options>, Options>
  : ParseNormalize<ParseDeep<Value, Options>, Options>

type ParseNormalize<
  Value,
  Options extends ParseOptions,
> = Options['loose'] extends true ? Value : Value extends Error ? Value : Error

type ParseShallow<
  Value,
  Options extends ParseOptions,
> = Value extends MinimalErrorObject
  ? ParsedError<Value, Options> & {
      [Key in keyof Value as Value[Key] extends (
        Key extends keyof ParsedError<Value, Options>
          ? ParsedError<Value, Options>[Key]
          : unknown
      )
        ? Key
        : never]: Value[Key]
    }
  : Value

type ParseDeep<
  Value,
  Options extends ParseOptions,
> = Value extends MinimalErrorObject
  ? ParsedError<Value, Options> & {
      [Key in keyof Value as Key extends keyof ParsedError<Value, Options>
        ? ParseDeep<Value[Key], Options> extends ParsedError<
            Value,
            Options
          >[Key]
          ? Key
          : never
        : Key]: ParseDeep<Value[Key], Options>
    }
  : Value extends object
  ? { [Key in keyof Value]: ParseDeep<Value[Key], Options> }
  : Value

type ParsedError<
  ErrorObjectArg extends MinimalErrorObject,
  Options extends ParseOptions,
> = ErrorObjectArg extends { name: string }
  ? NonNullable<Options['classes']>[ErrorObjectArg['name']] extends ErrorClass
    ? InstanceType<NonNullable<Options['classes']>[ErrorObjectArg['name']]>
    : Error
  : Error
