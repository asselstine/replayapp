import { linear } from './streams'
import { round } from './round'

export const Versus = {
  splitTimeAt (segmentEffortTimes, versusDeltaTimes, streamTime) {
    if (!segmentEffortTimes.length || !versusDeltaTimes.length) {
      return 0
    }
    var split = linear(streamTime, segmentEffortTimes, versusDeltaTimes)
    return round(split, 2)
  }
}
