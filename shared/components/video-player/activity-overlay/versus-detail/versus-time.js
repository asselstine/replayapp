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
  constructor (props) {
    super(props)
    this.state = this.createState(props, props.currentStreamTime)
  }

  componentWillReceiveProps (props) {
    this.setState(this.createState(this.props, props.currentStreamTime))
  }

  onStreamTimeProgress (streamTime) {
    this.setState(this.createState(this.props, streamTime))
  }

  createState (props, streamTime) {
    var currentSplitTime = Versus.splitTimeAt(props.segmentEffortTimeStream, props.versusDeltaTimes, streamTime)
    console.log('currentSplitTime: ', props.segmentEffortTimeStream, props.versusDeltaTimes, streamTime)
    return {
      style: this.createStyle(props, currentSplitTime),
      label: this.formatLabel(currentSplitTime)
    }
  }

  formatLabel (splitTime) {
    var duration = moment.duration(splitTime * 1000)
    var label = `${formatSplit(duration)}s`
    if (splitTime > 0) {
      label = `+${label}`
    }
    return label
  }

  createStyle (props, splitTime) {
    var style = props.style
    if (splitTime <= 0) {
      style = _.merge({}, style, props.positiveStyle)
    } else {
      style = _.merge({}, style, props.negativeStyle)
    }
    return style
  }

  render () {
    return (
      <Text style={this.state.style}>{this.state.label}</Text>
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
