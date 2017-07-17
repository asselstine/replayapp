import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  PanResponder
} from 'react-native'
import _ from 'lodash'
import { StreamTimeGraph } from './stream-time-graph'

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
      <View {...this._panResponder.panHandlers} style={this.props.style}>
        {velocityStreamTimeGraph}
        {altitudeStreamTimeGraph}
      </View>
    )
  }
}

ActivityStreams.propTypes = {
  style: PropTypes.object,
  streamTime: PropTypes.number,
  streams: PropTypes.object,
  activity: PropTypes.object.isRequired,
  videoDuration: PropTypes.number.isRequired,
  videoStartAt: PropTypes.any.isRequired
}

ActivityStreams.defaultProps = {
  style: {
    flex: 1
  }
}
