import React, {
  Component
} from 'react'
import {
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import { SegmentService } from '../../../../services/segment-service'
import { Versus } from '../../../../versus'
import _ from 'lodash'
import formatSplit from '../../../../format-split'
import moment from 'moment'

export class VersusTime extends Component {
  render () {
    var currentSplitTime = Versus.splitTimeAt(this.props.segmentEffortTimeStream, this.props.versusDeltaTimes, this.props.currentStreamTime)
    var style = this.props.style
    var label = '' + formatSplit(moment.duration(currentSplitTime * 1000))
    if (currentSplitTime <= 0) {
      style = _.merge({}, style, this.props.positiveStyle)
    } else {
      label = `+${label}`
      style = _.merge({}, style, this.props.negativeStyle)
    }
    return (
      <Text style={style}>{label}s</Text>
    )
  }
}

VersusTime.propTypes = {
  positiveStyle: PropTypes.any,
  negativeStyle: PropTypes.any,
  segmentEffort: PropTypes.object.isRequired,
  segmentEffortTimeStream: PropTypes.array.isRequired,
  versusDeltaTimes: PropTypes.array.isRequired,
  versusLeaderboardEntry: PropTypes.object.isRequired,
  currentStreamTime: PropTypes.number.isRequired
}
