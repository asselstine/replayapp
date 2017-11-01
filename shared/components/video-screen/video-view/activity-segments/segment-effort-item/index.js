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
          style={styles.segmentRace} />
    }

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
              <Text style={styles.headerData}>{_.get(this.props, 'segmentEffort.distance')}m</Text>
              <Text style={styles.headerData}>{_.get(this.props, 'segmentEffort.elapsed_time')}s</Text>
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
    width: 60
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
  video: PropTypes.object.isRequired
}
