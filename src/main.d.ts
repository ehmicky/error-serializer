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
   * Called before serializing each `errorInstance`.
   *
   * @example
   * ```js
   * const errors = [new Error('test')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(error) {
   *     error.date = error.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(error, errorObject) {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObject) {
   *     errorObject.date = new Date(errorObject.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObject, error) {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly beforeSerialize?: (errorInstance: Error) => void

  /**
   * Called after serializing each `errorInstance`.
   *
   * @example
   * ```js
   * const errors = [new Error('test')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(error) {
   *     error.date = error.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(error, errorObject) {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObject) {
   *     errorObject.date = new Date(errorObject.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObject, error) {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly afterSerialize?: (
    errorInstance: Error,
    errorObject: ErrorObject,
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
   * Called before parsing each `errorObject`.
   *
   * @example
   * ```js
   * const errors = [new Error('test')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(error) {
   *     error.date = error.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(error, errorObject) {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObject) {
   *     errorObject.date = new Date(errorObject.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObject, error) {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly beforeParse?: (errorObject: MinimalErrorObject) => void

  /**
   * Called after parsing each `errorObject`.
   *
   * @example
   * ```js
   * const errors = [new Error('test')]
   * errors[0].date = new Date()
   *
   * const errorObjects = serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(error) {
   *     error.date = error.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(error, errorObject) {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   loose: true,
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObject) {
   *     errorObject.date = new Date(errorObject.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObject, error) {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly afterParse?: (
    errorObject: MinimalErrorObject,
    errorInstance: Error,
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
> = NonNullable<Options['classes']>[ErrorObjectArg['name']] extends ErrorClass
  ? InstanceType<NonNullable<Options['classes']>[ErrorObjectArg['name']]>
  : Error
