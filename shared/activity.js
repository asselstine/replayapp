import _ from 'lodash'
import { linear } from './streams'
import { round } from './round'

export const Activity = {
  velocityAt (streams, streamTime) {
    var times = _.get(streams, 'time.data', [])
    var velocitySmooth = _.get(streams, 'velocity_smooth.data', [])
    var speed = linear(streamTime, times, velocitySmooth)
    return round((speed * 3600.0) / 1000.0, 2)
  },

  altitudeAt (streams, streamTime) {
    var times = _.get(streams, 'time.data', [])
    var altitude = _.get(streams, 'altitude.data', [])
    return Math.round(linear(streamTime, times, altitude))
  }
}
