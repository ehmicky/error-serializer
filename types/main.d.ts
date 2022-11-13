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

  /**
   * Called before serializing each `errorInstance`.
   *
   * @example
   * ```js
   * const error = new Error('test')
   * error.date = new Date()
   * const errors = [error]
   *
   * const errorObjects = serialize(errors, {
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(errorArg) {
   *     errorArg.date = errorArg.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(errorArg) {
   *     errorArg.date = new Date(errorArg.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObjectArg) {
   *     errorObjectArg.date = new Date(errorObjectArg.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObjectArg) {
   *     errorObjectArg.date = errorObjectArg.date.toString()
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
   * const error = new Error('test')
   * error.date = new Date()
   * const errors = [error]
   *
   * const errorObjects = serialize(errors, {
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(errorArg) {
   *     errorArg.date = errorArg.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(errorArg) {
   *     errorArg.date = new Date(errorArg.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObjectArg) {
   *     errorObjectArg.date = new Date(errorObjectArg.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObjectArg) {
   *     errorObjectArg.date = errorObjectArg.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly afterSerialize?: (errorInstance: Error) => void
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
> = Options['normalize'] extends true
  ? Value extends Error
    ? Value
    : Error
  : Value

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
   * const error = new Error('test')
   * error.date = new Date()
   * const errors = [error]
   *
   * const errorObjects = serialize(errors, {
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(errorArg) {
   *     errorArg.date = errorArg.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(errorArg) {
   *     errorArg.date = new Date(errorArg.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObjectArg) {
   *     errorObjectArg.date = new Date(errorObjectArg.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObjectArg) {
   *     errorObjectArg.date = errorObjectArg.date.toString()
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
   * const error = new Error('test')
   * error.date = new Date()
   * const errors = [error]
   *
   * const errorObjects = serialize(errors, {
   *   // Serialize `Date` instances as strings
   *   beforeSerialize(errorArg) {
   *     errorArg.date = errorArg.date.toString()
   *   },
   *   // Restore `error.date` after serializing it
   *   afterSerialize(errorArg) {
   *     errorArg.date = new Date(errorArg.date)
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = parse(errorObjects, {
   *   // Parse date strings as `Date` instances
   *   beforeParse(errorObjectArg) {
   *     errorObjectArg.date = new Date(errorObjectArg.date)
   *   },
   *   // Restore `errorObject.date` after parsing
   *   afterParse(errorObjectArg) {
   *     errorObjectArg.date = errorObjectArg.date.toString()
   *   },
   * })
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly afterParse?: (errorObject: MinimalErrorObject) => void
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
> = Options['normalize'] extends true
  ? Value extends Error
    ? Value
    : Error
  : Value

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
