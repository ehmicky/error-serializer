import test from 'ava'
import { each } from 'test-each'

import { serialize } from 'error-serializer'

const expectedErrorObject = { name: 'Error', message: 'test' }

each(
  [{ include: ['name', 'message'] }, { exclude: ['stack'] }],
  ({ title }, options) => {
    test(`"include" and "exclude" are called during serialization | ${title}`, (t) => {
      t.deepEqual(serialize(new Error('test'), options), expectedErrorObject)
    })

    test(`"include" and "exclude" are called after normalization | ${title}`, (t) => {
      t.deepEqual(serialize('test', options), expectedErrorObject)
    })

    test(`"include" and "exclude" are called deeply | ${title}`, (t) => {
      t.deepEqual(
        serialize({ deep: new Error('test') }, { loose: true, ...options })
          .deep,
        expectedErrorObject,
      )
    })
  },
)

each(
  [{ include: ['message'] }, { exclude: ['cause'] }],
  ({ title }, options) => {
    test(`"include" and "exclude" are called bottom-up, after transformObject() | ${title}`, (t) => {
      const error = new Error('test', { cause: 'cause' })
      const causes = []
      const errorObject = serialize(error, {
        transformObject: ({ cause }) => {
          // eslint-disable-next-line fp/no-mutating-methods
          causes.push(cause)
        },
        ...options,
      })
      t.is(errorObject.cause, undefined)
      t.is(causes[0], undefined)
      t.is(causes[1].message, error.cause.message)
    })
  },
)

each([{ include: ['one'] }, { exclude: ['two'] }], ({ title }, options) => {
  test(`"include" and "exclude" are called on non-errors if not loose | ${title}`, (t) => {
    const errorObject = serialize(
      { message: 'test', one: true, two: true },
      options,
    )
    t.false('two' in errorObject)
    t.true(errorObject.one)
  })

  test(`"include" and "exclude" are not called on non-errors if loose | ${title}`, (t) => {
    const errorObject = serialize(
      { message: 'test', one: true, two: true },
      { loose: true, ...options },
    )
    t.true(errorObject.one)
    t.true(errorObject.two)
  })
})

each(
  [{ include: ['name', 'message', 'one'] }, { exclude: ['stack', 'two'] }],
  ({ title }, options) => {
    test(`"include" and "exclude" can be called with "transformObject" | ${title}`, (t) => {
      t.deepEqual(
        serialize(new Error('test'), {
          transformObject: (errorObject) => {
            // eslint-disable-next-line fp/no-mutating-assign
            Object.assign(errorObject, { one: true, two: true })
          },
          ...options,
        }),
        { ...expectedErrorObject, one: true },
      )
    })
  },
)

test('"include" can be called with "exclude"', (t) => {
  t.deepEqual(
    serialize(new Error('test'), {
      include: ['name', 'message'],
      exclude: ['name'],
    }),
    { message: 'test' },
  )
})

each([{ include: [] }, { exclude: ['message'] }], ({ title }, options) => {
  test(`"include" and "exclude" always include message | ${title}`, (t) => {
    t.is(serialize(new Error('test'), options).message, 'test')
  })
})

each(
  [
    { include: ['message', 'unknown'] },
    { exclude: ['name', 'stack', 'unknown'] },
  ],
  ({ title }, options) => {
    test(`"include" and "exclude" can use non-existing properties | ${title}`, (t) => {
      t.deepEqual(serialize(new Error('test'), options), { message: 'test' })
    })
  },
)

const definePropertyTransform = (descriptor, errorObject) => {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(errorObject, 'prop', {
    enumerable: true,
    writable: true,
    configurable: true,
    ...descriptor,
  })
}

each(
  [{ include: ['name', 'message', 'prop'] }, { exclude: ['stack'] }],
  ({ title }, options) => {
    test(`"include" and "exclude" ignore undefined values | ${title}`, (t) => {
      t.deepEqual(
        serialize(new Error('test'), {
          transformObject: (errorObject) => {
            // eslint-disable-next-line fp/no-mutation, no-param-reassign
            errorObject.prop = undefined
          },
          ...options,
        }),
        expectedErrorObject,
      )
    })

    test(`"include" and "exclude" ignore non-enumerables | ${title}`, (t) => {
      t.deepEqual(
        serialize(new Error('test'), {
          transformObject: definePropertyTransform.bind(undefined, {
            value: true,
            enumerable: false,
          }),
          ...options,
        }),
        expectedErrorObject,
      )
    })

    test(`"include" and "exclude" ignore unsafe values | ${title}`, (t) => {
      t.deepEqual(
        serialize(new Error('test'), {
          transformObject: definePropertyTransform.bind(undefined, {
            get: () => {
              throw new Error('unsafe')
            },
          }),
          ...options,
        }),
        expectedErrorObject,
      )
    })
  },
)

each(
  [{ include: ['name', 'message', 'prop'] }, { exclude: ['stack'] }],
  [{ writable: false }, { configurable: false }],
  ({ title }, options, descriptor) => {
    test(`"include" and "exclude" do not ignore non-writable and non-configurable | ${title}`, (t) => {
      t.deepEqual(
        serialize(new Error('test'), {
          transformObject: definePropertyTransform.bind(undefined, {
            ...descriptor,
            value: true,
          }),
          ...options,
        }),
        { ...expectedErrorObject, prop: true },
      )
    })
  },
)
