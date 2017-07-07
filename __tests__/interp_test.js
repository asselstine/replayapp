import { linear } from '../shared/interp'

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
