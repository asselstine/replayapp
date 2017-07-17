import { timeToIndex, linearIndex } from './streams'

export const streamPoints = function (height, width, timeStream, dataStream, zoom) {
  var timeMin = timeStream[0]
  var timeMax = timeStream[timeStream.length - 1]

  var minValue = Math.min(...dataStream)
  var maxValue = Math.max(...dataStream)

  var index = -1
  var points = []
  var time, value, xFraction, yFraction

  var numPoints = 100.0

  for (var i = 0; i <= numPoints; i++) {
    xFraction = (i / numPoints)
    time = timeMin + xFraction * (timeMax - timeMin)
    index = timeToIndex(time, timeStream, index)
    value = linearIndex(index, dataStream)
    yFraction = (maxValue - value) / (maxValue - minValue)
    points.push([xFraction * width * zoom, (yFraction * (height - 2))])
  }

  return points
}
