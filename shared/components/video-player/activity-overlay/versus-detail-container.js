import { connect } from 'react-redux'
import { VersusDetail } from './versus-detail'
import _ from 'lodash'

export const VersusDetailContainer = connect(
  (state, ownProps) => {
    return {
      // totalEntries: _.get(state, `segments[${ownProps.segmentEffort.segment.id}].leaderboard.entry_count`),
      leaderboardEntries: _.get(state, `segments[${ownProps.segmentEffort.segment.id}].leaderboard.entries`, [])
    }
  }
)(VersusDetail)
