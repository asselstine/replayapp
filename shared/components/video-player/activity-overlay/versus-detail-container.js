import { connect } from 'react-redux'
import { VersusDetail } from './versus-detail'
import { SegmentsFinder } from '../../../finders/segments-finder'

export const VersusDetailContainer = connect(
  (state, ownProps) => {
    return {
      leaderboardEntries: SegmentsFinder.findLeaderboardEntries(state, ownProps.segmentEffort.segment.id)
    }
  }
)(VersusDetail)
