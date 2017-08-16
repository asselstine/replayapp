import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import {
  streamPoints,
  viewportTransform
} from '../shared/svg'

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

describe('viewportTransform', () => {
  it('should create a transform that works!', () => {
    var transform = viewportTransform(20, 20, 30, 20)
    var origin = MatrixMath.multiplyVectorByMatrix([20, 0, 0, 1], transform)
    expect(origin[0]).toEqual(30)
    var end = MatrixMath.multiplyVectorByMatrix([40, 0, 0, 1], transform)
    expect(end[0]).toEqual(50)
  })
})
