import { timeToIndex, linear } from '../shared/streams'

/* global describe, it, expect */

describe('timeToIndex', () => {
  it('should return the first index', () => {
    expect(timeToIndex(1, [3, 4, 5])).toEqual(0)
    expect(timeToIndex(1, [3, 4, 5], -1)).toEqual(0)
  })

  it('should interpolate an index', () => {
    expect(timeToIndex(2, [1, 3])).toEqual(0.5)
  })

  it('should return the last index if greater', () => {
    expect(timeToIndex(10, [1, 2, 4])).toEqual(2)
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
