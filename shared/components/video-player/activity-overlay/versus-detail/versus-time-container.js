import { connect } from 'react-redux'
import { VersusTime } from './versus-time'
import { SegmentsFinder } from '../../../../finders/segments-finder'
import { ActivitiesFinder } from '../../../../finders/activities-finder'
import _ from 'lodash'

export const VersusTimeContainer = connect(
  (state, ownProps) => {
    var segmentId = ownProps.segmentEffort.segment.id
    var segmentEffortId = ownProps.segmentEffort.id
    var versusEffortId = ownProps.versusLeaderboardEntry.effort_id
    return {
      versusDeltaTimes: SegmentsFinder.findDeltaTimes(state, segmentId, segmentEffortId, versusEffortId) || [],
      segmentEffortTimeStream: ActivitiesFinder.findSegmentEffortTimeStream(state, ownProps.segmentEffort)
    }
  }
)(VersusTime)
