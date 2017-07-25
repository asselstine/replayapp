import { valueToIndex, linearIndex } from './streams'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const transformPoints = function (streamPoints, transform) {
  return streamPoints.map((point) => {
    var vx = MatrixMath.multiplyVectorByMatrix([point[0], point[1], 0, 1], transform)
    return [vx[0], vx[1]]
  })
}

export const streamPoints = function (height, width, xStream, yStream) {
  var xMin = xStream[0]
  var xMax = xStream[xStream.length - 1]

  var yMin = Math.min(...yStream)
  var yMax = Math.max(...yStream)

  var index = -1
  var points = []
  var x, value, xFraction, yFraction

  var numPoints = 100.0

  var worldX, worldY

  for (var i = 0; i <= numPoints; i++) {
    xFraction = (i / numPoints)
    x = xMin + xFraction * (xMax - xMin)
    index = valueToIndex(x, xStream, index)
    value = linearIndex(index, yStream)
    yFraction = (yMax - value) / (yMax - yMin)
    worldX = xFraction * width
    worldY = yFraction * (height - 2)
    points.push([worldX, worldY])
  }

  return points
}

export const zeroScreenY = function (height, yStream) {
  var yMin = Math.min(...yStream)
  var yMax = Math.max(...yStream)

  var zeroScale = yMin / (yMax - yMin)
  return zeroScale * height + height
}
