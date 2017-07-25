import { valueToIndex, linear, versusDeltaTimes } from '../shared/streams'

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
