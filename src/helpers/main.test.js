// Simple error plain object to test with
export const SIMPLE_ERROR_OBJECT = { message: 'message' }

// Error with `cause` and `errors` set
export const FULL_ERROR = Object.defineProperties(new Error('test'), {
  cause: {
    value: new Error('inner'),
    enumerable: false,
    writable: true,
    configurable: true,
  },
  errors: {
    value: [new Error('otherInner')],
    enumerable: false,
    writable: true,
    configurable: true,
  },
})

// Error to spy on constructor arguments
// eslint-disable-next-line fp/no-class
export class CustomError extends Error {
  constructor(...args) {
    super(...args)
    // eslint-disable-next-line fp/no-mutation, fp/no-this
    this.args = args

    if (args[0] === 'setConstructorArgs') {
      // eslint-disable-next-line fp/no-mutation, fp/no-this
      this.constructorArgs = args
    }
  }
}

export const CUSTOM_ERROR_OBJECT = {
  ...SIMPLE_ERROR_OBJECT,
  name: CustomError.name,
}

export const addProp = (errorObject) => {
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  errorObject.prop = true
}

export const setTransformArgs = (state, ...args) => {
  state.args = args
}

export const setErrorNames = (firstArg, secondArg) => {
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  firstArg.names = [firstArg.name, secondArg.name]
}

export const unsafeTransform = () => {
  throw new Error('unsafe')
}
