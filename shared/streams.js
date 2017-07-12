import _ from 'lodash'

export const timeToIndex = function (time, times, fromIndex = 0) {
  var ceilIndex = _.findIndex(times, (valueTime) => valueTime >= time, Math.floor(fromIndex))
  var floorIndex = _.findLastIndex(times, (valueTime) => valueTime < time, ceilIndex)

  if (ceilIndex < 0) { return times.length - 1 }
  if (floorIndex < 0) { return 0 }

  var timeSpan = times[ceilIndex] - times[floorIndex]
  var timeDelta = time - times[floorIndex]
  var timeFraction = timeDelta / timeSpan

  var indexSpan = ceilIndex - floorIndex
  var indexFraction = timeFraction * indexSpan

  return floorIndex + indexFraction
}

// assume times are sorted
export const linear = function (time, times, values, fromIndex = 0) {
  var index = timeToIndex(time, times)
  return linearIndex(index, values)
}

export const linearIndex = function (index, values) {
  index = Math.max(0, Math.min(index, values.length))
  var floorIndex = Math.floor(index)
  var ceilIndex = Math.ceil(index)
  var fraction = index - floorIndex
  return values[floorIndex] + (values[ceilIndex] - values[floorIndex]) * fraction
}
