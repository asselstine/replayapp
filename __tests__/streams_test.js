import {
  valueToIndex,
  linear,
  versusDeltaTimes,
  minValueIndex,
  maxValueIndex,
  createBoundsTransform,
  interpolate
} from '../shared/streams'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

/* global describe, it, expect */

describe('valueToIndex', () => {
  it('should return the first index', () => {
    expect(valueToIndex(1, [3, 4, 5])).toEqual(0)
    expect(valueToIndex(1, [3, 4, 5], -1)).toEqual(0)
  })

  it('should interpolate an index', () => {
    expect(valueToIndex(2, [1, 3])).toEqual(0.5)
  })

  it('should return the last index if greater', () => {
    expect(valueToIndex(10, [1, 2, 4])).toEqual(2)
  })
})

describe('linear', () => {
  it('should return the first value if all greater', () => {
    expect(linear(1, [1, 2, 3], [4, 5, 6])).toEqual(4)
  })

  it('should return the last value if all less', () => {
    expect(linear(10, [1, 2, 3], [4, 5, 6])).toEqual(6)
  })

  it('should linearly interpolate intermediate values', () => {
    expect(linear(4, [1, 2, 3, 5], [6, 7, 2, 5])).toEqual(3.5)
    expect(linear(3, [1, 2, 3, 5], [6, 7, 2, 5])).toEqual(2)
  })
})

describe('versusDeltaTimes', () => {
  it('should return the time difference at each point', () => {
    expect(versusDeltaTimes(
      [0, 1, 2, 3, 4, 5, 6],
      [0, 1, 2, 3, 4, 5, 6],
      [0, 1, 2, 3],
      [0, 2, 4, 6]
    )).toEqual(
      [0, 0.5, 1, 1.5, 2, 2.5, 3]
    )
  })

  it('should handle distance inequalities', () => {
    expect(versusDeltaTimes(
      [0, 1, 2, 3],
      [0, 2, 4, 6],
      [0, 1, 2, 3],
      [0, 4, 8, 12]
    )).toEqual(
      [0, 0, 0, 0]
    )

    expect(versusDeltaTimes(
      [0, 1, 2, 3],
      [0, 2, 4, 6],
      [0, 1, 2, 3],
      [0, 8, 10, 12]
    )).toEqual(
      [0, 0.5, 1, 0]
    )
  })

  it('should handle transpositions', () => {
    expect(versusDeltaTimes(
      [10, 11, 12, 13],
      [10, 12, 14, 16],
      [2, 3, 4, 5],
      [0, 4, 8, 12]
    )).toEqual(
      [0, 0, 0, 0]
    )

    expect(versusDeltaTimes(
      [7, 8, 9, 10],
      [0, 2, 4, 6],
      [0, 1, 2, 3],
      [11, 19, 21, 23]
    )).toEqual(
      [0, 0.5, 1, 0]
    )
  })
})

describe('minValueIndex', () => {
  it('should retrieve the index of the minimum value', () => {
    expect(minValueIndex([1, 2, 4, 0, 4])).toEqual(3)
    expect(minValueIndex([1, 0, 4, 0, 4])).toEqual(1)
    expect(minValueIndex([0, 4, 10, 4])).toEqual(0)
  })
})

describe('maxValueIndex', () => {
  it('should retrieve the index of the maximum value', () => {
    expect(maxValueIndex([1, 2, 4, 0, 4])).toEqual(2)
    expect(maxValueIndex([11, 0, 4, 5, 4])).toEqual(0)
    expect(maxValueIndex([0, 4, 10, 4])).toEqual(2)
  })
})

describe('createBoundsTransform', () => {
  it('should translate and scale the data', () => {
    var transform = createBoundsTransform(
      [6, 8, 10, 12],
      [20, 30, 50, 40],
      0, 0, 100, 100
    )
    var vector = [6, 20, 0, 1]
    expect(MatrixMath.multiplyVectorByMatrix(vector, transform)).toEqual([0, 0, 0, 1])
    vector = [12, 50, 0, 1]
    vector = MatrixMath.multiplyVectorByMatrix(vector, transform)
    expect(vector[0]).toBeCloseTo(100)
    expect(vector[1]).toBeCloseTo(100)
  })

  it('should transform to non-origin coordinates', () => {
    var transform = createBoundsTransform(
      [6, 8, 10, 12],
      [20, 30, 50, 40],
      10, 20, 100, -100
    )
    var vector = [6, 20, 0, 1]
    vector = MatrixMath.multiplyVectorByMatrix(vector, transform)
    expect(vector[0]).toBeCloseTo(10)
    expect(vector[1]).toBeCloseTo(20)
    vector[0] = 12
    vector[1] = 50
    vector = MatrixMath.multiplyVectorByMatrix(vector, transform)
    expect(vector[0]).toBeCloseTo(110)
    expect(vector[1]).toBeCloseTo(-80)
  })
})

describe('interpolate', () => {
  it('Should re-interpolate arrays to new densities', () => {
    var times = [0, 1, 2, 4, 5, 6, 8, 9, 10]
    var values = [1, 2, 3, 5, 6, 7 ,9, 10, 11]
    var density = 5
    expect(interpolate({times, values, density})).toEqual({
      times: [0, 2, 4, 6, 8],
      values: [1, 3, 5, 7, 9]
    })
  })
})
