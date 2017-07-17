import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  PanResponder
} from 'react-native'
import _ from 'lodash'
import { StreamTimeGraph } from './stream-time-graph'
import { videoStreamTimes } from '../../../sync'
import { timeToIndex } from '../../../streams'

export class ActivityStreams extends PureComponent {
  componentWillMount () {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => { console.log('set'); return true },
      onMoveShouldSetPanResponder: () => { console.log('move'); return true },
      // onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: (event, gestureState) => { console.log(event.nativeEvent.touches, gestureState) },
      // onPanResponderRelease: this._handlePanResponderEnd,
      // onPanResponderTerminate: this._handlePanResponderEnd
      onPanResponderTerminationRequest: () => { console.log('terminate'); return false }
    })
  }

  render () {
    // var streamTimes = videoStreamTimes(this.props.activity, this.props.videoDuration, this.props.videoStartAt)
    //
    // console.log('stream times: ', streamTimes)
    //
    // var startIndex = Math.floor(timeToIndex(streamTimes.startTime, this.props.streams.time))
    // var endIndex = Math.ceil(timeToIndex(streamTimes.endTime, this.props.streams.time))
    //
    // var timeSubStream = _.slice(this.props.streams.time, startIndex, endIndex)
    // var velocitySubStream = _.slice(this.props.streams.velocity_smooth, startIndex, endIndex)
    // var altitudeSubStream = _.slice(this.props.streams.altitude, startIndex, endIndex)

    if (_.get(this.props, 'streams.velocity_smooth')) {
      var velocityStreamTimeGraph =
        <StreamTimeGraph
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.velocity_smooth.data} />
    }

    if (_.get(this.props, 'streams.altitude')) {
      var altitudeStreamTimeGraph =
        <StreamTimeGraph
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.altitude.data} />
    }

    return (
      <View {...this._panResponder.panHandlers}>
        {velocityStreamTimeGraph}
        {altitudeStreamTimeGraph}
      </View>
    )
  }
}

ActivityStreams.propTypes = {
  streams: PropTypes.object,
  activity: PropTypes.object.isRequired,
  videoDuration: PropTypes.number.isRequired,
  videoStartAt: PropTypes.any.isRequired
}
