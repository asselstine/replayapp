import {
  sortedIndexDistances,
  fractionAlongPath,
  pointFromFraction,
  closestPoint
} from '../shared/closest-point'

/* global describe, it, expect */

describe('sortedIndexDistances', () => {
  it('should sort by distance', () => {
    var distances = sortedIndexDistances(
      {
        latitude: 2,
        longitude: 2
      },
      [
        {
          latitude: 0, longitude: 0
        },
        {
          latitude: 1, longitude: 1
        },
        {
          latitude: 2, longitude: 2
        },
        {
          latitude: 3, longitude: 3
        }
      ]
    )

    expect(distances).toEqual([
      { index: 2, distance: 0 },
      { index: 1, distance: 2 },
      { index: 3, distance: 2 },
      { index: 0, distance: 8 }
    ])
  })
})

describe('fractionAlongPath', () => {
  it('should work', () => {
    expect(fractionAlongPath(
      { latitude: 0, longitude: 0 },
      { latitude: 4, longitude: 4 },
      { latitude: 2, longitude: 2 }
    )).toEqual(0.5)

    expect(fractionAlongPath(
      { latitude: 0, longitude: 0 },
      { latitude: 4, longitude: 4 },
      { latitude: 5, longitude: 5 }
    )).toEqual(1)

    expect(fractionAlongPath(
      { latitude: 0, longitude: 0 },
      { latitude: 4, longitude: 4 },
      { latitude: 3, longitude: 3 }
    )).toEqual(0.75)
  })
})

describe('pointFromFraction', () => {
  it('should work', () => {
    expect(pointFromFraction(
      { latitude: 1, longitude: 1 },
      { latitude: 4, longitude: 4 },
      0.5
    )).toEqual(
      { latitude: 2.5, longitude: 2.5 }
    )
  })
})

describe('closestPoint', () => {
  it('should work', () => {
    expect(closestPoint(
      { latitude: 2, longitude: 2 },
      [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 4 }
      ]
    )).toEqual(
      {
        point: { latitude: 0, longitude: 2 },
        startIndex: 0,
        endIndex: 1,
        fraction: 0.5,
        distance: 2
      }
    )
  })
})
