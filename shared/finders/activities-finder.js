import _ from 'lodash'

export const ActivitiesFinder = {
  findSegmentEffortTimeStream (state, segmentEffort) {
    var activityTimeStream = _.get(state, `activities['${segmentEffort.activity.id}'].streams.time.data`, [])
    return activityTimeStream.slice(segmentEffort.start_index, segmentEffort.end_index + 1)
  }
}
