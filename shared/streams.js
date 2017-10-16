import _ from 'lodash'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const valueToIndex = function (value, values, fromIndex = 0) {
  var ceilIndex = _.findIndex(values, (valueTime) => valueTime >= value, Math.floor(fromIndex))
  var floorIndex = _.findLastIndex(values, (valueTime) => valueTime < value, ceilIndex)

  if (ceilIndex < 0) { return values.length - 1 }
  if (floorIndex < 0) { return 0 }

  var valueSpan = values[ceilIndex] - values[floorIndex]
  var valueDelta = value - values[floorIndex]
  var valueFraction = valueDelta / valueSpan

  var indexSpan = ceilIndex - floorIndex
  var indexFraction = valueFraction * indexSpan

  return floorIndex + indexFraction
}

// https://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
export const minValueIndex = function (values) {
  return values.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0)
}

export const maxValueIndex = function (values) {
  return values.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
}

// assume times are sorted
export const linear = function (time, times, values, fromIndex = 0) {
  var index = valueToIndex(time, times)
  return linearIndex(index, values)
}

export const linearIndex = function (index, values) {
  index = Math.max(0, Math.min(index, values.length))
  var floorIndex = Math.floor(index)
  var ceilIndex = Math.ceil(index)
  var fraction = index - floorIndex
  return values[floorIndex] + (values[ceilIndex] - values[floorIndex]) * fraction
}

/*
  Takes a stream on times and distances and compares it against the versus times and distance.

  Returns a new stream of the delta times.

  NOTE: normalizes the versus distance as well; this may skew results.
*/
export const versusDeltaTimes = function (times, distances, VersusDetails, versusDistances) {
  var distanceMax = distances[distances.length - 1]
  var versusDistanceMax = versusDistances[versusDistances.length - 1]
  var distanceMin = distances[0]
  var versusDistanceMin = versusDistances[0]
  var distanceScale = (versusDistanceMax - versusDistanceMin) / (1.0 * (distanceMax - distanceMin))
  var versusIndex = 0
  return _.map(distances, (distance, index) => {
    var versusDistance = (distance - distanceMin) * distanceScale
    versusIndex = valueToIndex(versusDistanceMin + versusDistance, versusDistances, versusIndex)
    var VersusDetail = linearIndex(versusIndex, VersusDetails)
    var deltaTime = (times[index] - times[0]) - (VersusDetail - VersusDetails[0])
    return deltaTime
  })
}

export function createBoundsTransform (xStream, yStream, x, y, width, height) {
  var xMin = xStream[0]
  var xMax = xStream[xStream.length - 1]

  var yMin = Math.min(...yStream)
  var yMax = Math.max(...yStream)

  var xScale = (width) / Math.max(1, xMax - xMin)
  var yScale = (height) / Math.max(1, yMax - yMin)

  var translate = MatrixMath.createIdentityMatrix()
  var scale = MatrixMath.createIdentityMatrix()
  MatrixMath.reuseTranslate2dCommand(translate, -x, -y)
  MatrixMath.reuseScale3dCommand(scale, xScale, yScale, 1)
  MatrixMath.multiplyInto(scale, scale, translate)
  MatrixMath.reuseTranslate2dCommand(translate, x, y)
  MatrixMath.multiplyInto(scale, translate, scale)

  var xTranslate = x - xMin
  var yTranslate = y - yMin
  MatrixMath.reuseTranslate2dCommand(translate, xTranslate, yTranslate)

  MatrixMath.multiplyInto(translate, scale, translate)

  return translate
}
