import { streamPoints } from '../shared/svg'

/* global expect, describe, it */

describe('streamPoints', () => {
  it('should return sensible stream points!', () => {
    var points = streamPoints(
      -100, 100,
      [0, 1, 2, 5],
      [10, 20, 60, 20]
    )
    expect(points).toEqual([
      [0, -100], [20, -80], [40, 0], [100, -80]
    ])
  })
})
