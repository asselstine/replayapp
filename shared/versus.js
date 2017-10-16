import { linear } from './streams'
import { round } from './round'

export const Versus = {
  splitTimeAt (segmentEffortTimes, versusDeltaTimes, streamTime) {
    var split = linear(streamTime, segmentEffortTimes, versusDeltaTimes)
    return round(split, 2)
  }
}
