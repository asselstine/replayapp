import {
  createBoundsTransform
} from './streams'
import _ from 'lodash'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const transformPoints = function (streamPoints, transform) {
  return streamPoints.map((point) => {
    var vx = MatrixMath.multiplyVectorByMatrix([point[0], point[1], 0, 1], transform)
    return [vx[0], vx[1]]
  })
}

export const mergeStreams = function (xStream, yStream) {
  return _.zip(xStream, yStream)
}

export const streamPoints = function (height, width, xStream, yStream) {
  // the transform can turn world -> screen coordinates
  var transform = createBoundsTransform(xStream, yStream, 0, height, width, -height)
  var points = mergeStreams(xStream, yStream)
  return transformPoints(points, transform)
}

export const zeroScreenY = function (height, yStream) {
  var yMin = Math.min(...yStream)
  var yMax = Math.max(...yStream)

  var zeroScale = yMin / (yMax - yMin)
  return zeroScale * height + height
}
