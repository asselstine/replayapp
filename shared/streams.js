import _ from 'lodash'

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
export const versusDeltaTimes = function (times, distances, versusTimes, versusDistances, movings, versusMovings) {
  var distanceMax = distances[distances.length - 1]
  var versusDistanceMax = versusDistances[versusDistances.length - 1]
  var distanceMin = distances[0]
  var versusDistanceMin = versusDistances[0]
  var distanceScale = (versusDistanceMax - versusDistanceMin) / (1.0 * (distanceMax - distanceMin))
  var versusIndex = 0
  return _.map(distances, (distance, index) => {
    var versusDistance = (distance - distanceMin) * distanceScale
    versusIndex = valueToIndex(versusDistanceMin + versusDistance, versusDistances, versusIndex)
    var versusMoving = versusMovings[Math.floor(versusIndex)]
    var versusTime = linearIndex(versusIndex, versusTimes)
    var deltaTime = (times[index] - times[0]) - (versusTime - versusTimes[0])
    console.log(`${deltaTime} @ index ${index}: ${movings[index]} time ${times[index]} at ${distance} vs ${versusMoving} ${versusTime} at ${versusDistance}`)
    return deltaTime
  })
}
