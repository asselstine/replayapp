import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { SegmentsFinder } from '../../../finders/segments-finder'
import { connect } from 'react-redux'
import { VersusSelect } from './versus-detail/versus-select'

export const SegmentLeaderboardSelect = connect(
  (state, ownProps) => {
    return {
      leaderboardEntries: SegmentsFinder.findLeaderboardEntries(state, ownProps.segmentId)
    }
  }
)(VersusSelect)

SegmentLeaderboardSelect.propTypes = {
  segmentId: PropTypes.number.isRequired
}
