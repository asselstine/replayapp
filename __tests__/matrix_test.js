import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import Matrix from '../shared/matrix'

/* global describe, it, expect */

function setup () {
  var result = MatrixMath.createIdentityMatrix()
  // translate origin
  var translate = MatrixMath.createTranslate2d(10, 0)

  // double scale around 5,0
  var move = MatrixMath.createTranslate2d(-5, 0)
  var scale = MatrixMath.createScale(2)
  var move2 = MatrixMath.createTranslate2d(5, 0)

  MatrixMath.multiplyInto(result, translate, result)
  MatrixMath.multiplyInto(result, move, result)
  MatrixMath.multiplyInto(result, scale, result)
  MatrixMath.multiplyInto(result, move2, result)
  return result
}

describe('toWorldCoordinate', () => {
  it('translates the origin correctly', () => {
    expect(Matrix.toWorldCoordinate(0, MatrixMath.createTranslate2d(10, 0))).toEqual(10)
  })
  it('translates more complex locations', () => {
    var matrix = setup()
    expect(Matrix.toWorldCoordinate(0, matrix)).toEqual(15)
    expect(Matrix.toWorldCoordinate(10, matrix)).toEqual(35)
  })
})

describe('fromWorldCoordinate', () => {
  it('translates correctly', () => {
    var matrix = setup()
    expect(Matrix.fromWorldCoordinate(35, matrix)).toEqual(10)
  })
})
