import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export function toWorldCoordinate (x, matrix) {
  var vector = [x, 0, 0, 1]
  var result = MatrixMath.multiplyVectorByMatrix(vector, matrix)
  return result[0]
}

export function fromWorldCoordinate (x, matrix) {
  var vector = [x, 0, 0, 1]
  var result = MatrixMath.multiplyVectorByMatrix(vector, MatrixMath.inverse(matrix))
  return result[0]
}
