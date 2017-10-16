import { connect } from 'react-redux'
import { VersusTime } from './versus-time'
import _ from 'lodash'

export const VersusTimeContainer = connect(
  (state, ownProps) => {
    var activityId = ownProps.segmentEffort.activity.id
    var activityTimeStream = _.get(state, `activities['${activityId}'].streams.time.data`)
    if (activityTimeStream) {
      var segmentEffortTimeStream = activityTimeStream.slice(ownProps.segmentEffort.start_index, ownProps.segmentEffort.end_index + 1)
    }
    var effortKey = `${ownProps.segmentEffort.id} ${ownProps.versusLeaderboardEntry.effort_id}`
    var versusDeltaTimes = _.get(state, `segments[${ownProps.segmentEffort.segment.id}].comparisons[${effortKey}].delta_time`)
    return {
      versusDeltaTimes: versusDeltaTimes || [],
      segmentEffortTimeStream: segmentEffortTimeStream || []
    }
  }
)(VersusTime)
