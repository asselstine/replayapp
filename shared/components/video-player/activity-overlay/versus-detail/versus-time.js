import React, {
  Component
} from 'react'
import {
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import { SegmentService } from '../../../../services/segment-service'
import { Versus } from '../../../../versus'

export class VersusTime extends Component {
  render () {
    var currentSplitTime = Versus.splitTimeAt(this.props.segmentEffortTimeStream, this.props.versusDeltaTimes, this.props.currentStreamTime)
    return (
      <Text style={this.props.style}>{currentSplitTime}</Text>
    )
  }
}

VersusTime.propTypes = {
  segmentEffort: PropTypes.object.isRequired,
  segmentEffortTimeStream: PropTypes.array.isRequired,
  versusDeltaTimes: PropTypes.array.isRequired,
  versusLeaderboardEntry: PropTypes.object.isRequired,
  currentStreamTime: PropTypes.number.isRequired
}
