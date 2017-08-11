import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  View,
  Animated,
  PanResponder,
  Text
} from 'react-native'
import moment from 'moment'
import formatDuration from '../../../format-duration'

export class Timeline extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTime: props.currentTime,
      progress: new Animated.Value(0),
      timelineWidth: 1
    }
    this.onTimelinePanResponder = this.onTimelinePanResponder.bind(this)
    this._onTimelineResponderLayout = this._onTimelineResponderLayout.bind(this)
    this._timelineResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: this.onTimelinePanResponder,
      onPanResponderMove: this.onTimelinePanResponder
    })
  }

  onTimelinePanResponder (e) {
    var progress = e.nativeEvent.locationX / this.state.timelineWidth
    progress = Math.max(0, Math.min(1, progress))
    this.props.onVideoTimeChange(this.props.duration * progress)
  }

  componentWillReceiveProps (props) {
    this.updateCurrentTime(props.currentTime)
  }

  updateCurrentTime (currentTime) {
    // console.log(`Timeline updateCurrentTime: ${currentTime}`)
    this.setState({
      currentTime: currentTime
    })
    var progress = currentTime / this.props.duration
    this.state.progress.setValue(progress)
  }

  _onTimelineResponderLayout (event) {
    this.setState({
      timelineWidth: _.get(event, 'nativeEvent.layout.width') || 1
    })
  }

  _formatElapsedTime () {
    return formatDuration(moment.duration(this.state.currentTime * 1000))
  }

  _formatRemainingTime () {
    return formatDuration(moment.duration(this.props.duration * 1000).subtract(moment.duration(this.state.currentTime * 1000)))
  }

  render () {
    var progressWidth = this.state.progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    })
    return (
      <View style={styles.container}>
        <Text style={{...styles.leftText, ...styles.time}}>{this._formatElapsedTime()}</Text>
        <View style={styles.timeline} {...this._timelineResponder.panHandlers} onLayout={this._onTimelineResponderLayout}>
          <View style={styles.timelineTotal} />
          <Animated.View style={{
            ...styles.timelineProgress,
            width: progressWidth
          }} />
        </View>
        <Text style={{...styles.rightText, ...styles.time}}>{this._formatRemainingTime()}</Text>
      </View>
    )
  }
}

const timelineHeight = 4

const styles = {
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1
  },

  time: {
    flex: 0,
    width: 50,
    padding: 5,
    color: 'white'
  },

  leftText: {
    textAlign: 'left'
  },

  rightText: {
    textAlign: 'right'
  },

  timeline: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    height: 40
  },

  timelineTotal: {
    backgroundColor: 'white',
    height: timelineHeight,
    width: '100%'
  },

  timelineProgress: {
    backgroundColor: 'red',
    height: timelineHeight,
    position: 'absolute',
    left: 0
  }
}

Timeline.propTypes = {
  currentTime: PropTypes.any.isRequired,
  duration: PropTypes.any.isRequired,
  onVideoTimeChange: PropTypes.func.isRequired
}
