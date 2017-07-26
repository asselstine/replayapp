import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export default {
  toWorldCoordinate (x, matrix) {
    var vector = [x, 0, 0, 1]
    var result = MatrixMath.multiplyVectorByMatrix(vector, matrix)
    return result[0]
  },

  fromWorldCoordinate (x, matrix) {
    var vector = [x, 0, 0, 1]
    var result = MatrixMath.multiplyVectorByMatrix(vector, MatrixMath.inverse(matrix))
    return result[0]
  },

  multiplyIntoVectorByMatrix (result, v, m) {
    result[0] = v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + v[3] * m[12]
    result[1] = v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + v[3] * m[13]
    result[2] = v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + v[3] * m[14]
    result[3] = v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + v[3] * m[15]
    return result
  }
}
