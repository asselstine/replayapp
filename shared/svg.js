import { timeToIndex, linearIndex } from './streams'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const streamPoints = function (height, width, timeStream, dataStream, transform) {
  var timeMin = timeStream[0]
  var timeMax = timeStream[timeStream.length - 1]

  var minValue = Math.min(...dataStream)
  var maxValue = Math.max(...dataStream)

  var index = -1
  var points = []
  var time, value, xFraction, yFraction

  var numPoints = 100.0

  var x, y

  for (var i = 0; i <= numPoints; i++) {
    xFraction = (i / numPoints)
    time = timeMin + xFraction * (timeMax - timeMin)
    index = timeToIndex(time, timeStream, index)
    value = linearIndex(index, dataStream)
    yFraction = (maxValue - value) / (maxValue - minValue)
    x = xFraction * width
    y = yFraction * (height - 2)
    if (transform) {
      var vx = MatrixMath.multiplyVectorByMatrix([x, 0, 0, 1], transform)
      x = vx[0]
    }
    points.push([x, y])
  }

  return points
}
