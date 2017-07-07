import _ from 'lodash'

// assume times are sorted
export const linear = function (time, times, values) {
  var ceilIndex = _.findIndex(times, (valueTime) => valueTime >= time)
  if (ceilIndex < 0) {
    return values[values.length - 1]
  }
  var floorIndex = ceilIndex - 1
  if (floorIndex < 0) {
    var result = values[ceilIndex]
  } else {
    var timeSpan = times[ceilIndex] - times[floorIndex]
    var timeDelta = time - times[floorIndex]
    var timeFraction = timeDelta / timeSpan
    var span = values[ceilIndex] - values[floorIndex]
    result = values[floorIndex] + span * timeFraction
  }
  return result
}
