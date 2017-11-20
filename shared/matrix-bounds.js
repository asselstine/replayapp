import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const MatrixBounds = {
  /*
  Ensures that the transform can't zoom out and make it tiny.
  */
  applyMinXScaleOf1 (boundaryTransform, currentTransform) {
    if (currentTransform[0] < 1) {
      boundaryTransform[0] = 1.0 / currentTransform[0]
    }
    return boundaryTransform
  },

  /*
  Ensures that the transform cannot expose any points less than the origin
  */
  applyMinXZero (boundaryTransform, currentTransform) {
    this.applyMinX(0, boundaryTransform, currentTransform)
  },

  applyMinX (x, boundaryTransform, currentTransform) {
    var transformedX = MatrixMath.multiplyVectorByMatrix([x, 0, 0, 1], currentTransform)
    var diff = transformedX[0] - x
    if (diff > 0) {
      MatrixMath.multiplyInto(boundaryTransform, MatrixMath.createTranslate2d(-diff, 0), boundaryTransform)
    }
    return boundaryTransform
  },

  applyMaxX (x, boundaryTransform, currentTransform) {
    var endPointDifference = MatrixMath.multiplyVectorByMatrix([x, 0, 0, 1], currentTransform)
    var diff = endPointDifference[0] - x
    if (diff < 0) {
      MatrixMath.multiplyInto(boundaryTransform, MatrixMath.createTranslate2d(-diff, 0), boundaryTransform)
    }
    return boundaryTransform
  },

  createBoundaryTransformX (x1, x2, matrix) {
    // matrix is the newTransform
    var boundedTransform = matrix.slice()
    var boundaryTransform = MatrixMath.createIdentityMatrix()

    MatrixBounds.applyMinXScaleOf1(boundaryTransform, matrix)
    MatrixMath.multiplyInto(boundedTransform, boundaryTransform, matrix)

    MatrixBounds.applyMinX(x1, boundaryTransform, boundedTransform)
    MatrixMath.multiplyInto(boundedTransform, boundaryTransform, matrix)

    MatrixBounds.applyMaxX(x2, boundaryTransform, boundedTransform)

    return boundaryTransform
  },

  applyBoundaryTransformX (x1, x2, newMatrix, oldMatrix) {
    var boundaryTransform = MatrixBounds.createBoundaryTransformX(x1, x2, oldMatrix)
    MatrixMath.multiplyInto(newMatrix, boundaryTransform, newMatrix)
    return newMatrix
  }
}
