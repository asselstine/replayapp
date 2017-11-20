import React, {
  Component
} from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { SegmentRace } from './segment-race'
import { track } from '../../../../../analytics'
import segmentEffortProperties from '../../../../../analytics/segment-effort-properties'
import formatDuration from '../../../../../format-duration'
import formatDistance from '../../../../../format-distance'

export class SegmentEffortItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      raceVisible: false
    }
  }

  _toggleRace (event) {
    this.setState({
      raceVisible: !this.state.raceVisible
    })
    track({
      event: 'VideoView Segment Effort',
      properties: {
        segmentEffort: segmentEffortProperties(this.props.segmentEffort)
      }
    })
  }

  render () {
    var komRank = _.get(this.props, 'segmentEffort.kom_rank')
    var prRank = _.get(this.props, 'segmentEffort.pr_rank')

    if (komRank) {
      var komRankLabel =
        <Text>KOM {komRank}</Text>
    }

    if (prRank) {
      var prRankLabel =
        <Text>PR {prRank}</Text>
    }

    var flex = 1
    if (this.state.raceVisible) {
      flex = 2
      var race =
        <SegmentRace
          video={this.props.video}
          eventEmitter={this.props.eventEmitter}
          segmentEffort={this.props.segmentEffort}
          onStreamTimeChange={this.props.onStreamTimeChange}
          onStreamTimeChangeStart={this.props.onStreamTimeChangeStart}
          onStreamTimeChangeEnd={this.props.onStreamTimeChangeEnd}
          style={styles.segmentRace} />
    }

    var duration = _.get(this.props, 'segmentEffort.elapsed_time') * 1000
    console.log('duration: ', typeof duration, duration)

    return (
      <View style={{flex: flex}}>
        <TouchableOpacity onPress={this._toggleRace.bind(this)}>
          <View style={styles.view}>
            <View style={styles.leftPane}>
              <Text style={styles.effortName}>{_.get(this.props, 'segmentEffort.name')}</Text>
              {komRankLabel}
              {prRankLabel}
            </View>
            <View style={styles.rightPane}>
              <Text style={styles.headerData}>{formatDistance(_.get(this.props, 'segmentEffort.distance'))}</Text>
              <Text style={styles.headerData}>{formatDuration(duration)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {race}
      </View>
    )
  }
}

const styles = {
  view: {
    padding: 10,
    flexDirection: 'row'
  },

  leftPane: {
    flex: 1
  },

  segmentRace: {
    flex: 1
  },

  rightPane: {
    width: 70
  },

  effortName: {
    fontSize: 22,
    fontWeight: '300'
  },

  headerData: {
    textAlign: 'right'
  }
}

SegmentEffortItem.propTypes = {
  segmentEffort: PropTypes.object,
  eventEmitter: PropTypes.object,
  onStreamTimeChange: PropTypes.func,
  onStreamTimeChangeStart: PropTypes.func,
  onStreamTimeChangeEnd: PropTypes.func,
  video: PropTypes.object.isRequired
}
