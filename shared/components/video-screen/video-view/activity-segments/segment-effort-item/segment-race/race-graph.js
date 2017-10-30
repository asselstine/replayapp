import React, {
  Component
} from 'react'
import {
  Svg,
  ClipPath,
  G,
  Line,
  Rect
} from 'react-native-svg'
import { RacePath } from './race-path'
import _ from 'lodash'
import PropTypes from 'prop-types'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import {
  mergeStreams,
  streamToPoints,
  pointsToPath,
  transformPoints
} from '../../../../../../svg'
import {
  interpolate
} from '../../../../../../streams'
import {
  linearIndex,
  minValueIndex,
  maxValueIndex,
  createBoundsTransform
} from '../../../../../../streams'
import { InfoLine } from './info-line'
import {
  PanResponder,
  Animated
} from 'react-native'

export class RaceGraph extends Component {
  constructor (props) {
    super(props)
    this._onLayout = this._onLayout.bind(this)
    this.state = {
      height: 1,
      width: 1,
      transform: MatrixMath.createIdentityMatrix(),
      inverseTransform: MatrixMath.createIdentityMatrix()
    }
    this.updateTransform = this.updateTransform.bind(this)
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)
  }

  componentWillMount () {
    if (this.props.eventEmitter) {
      this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
    }
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderGrant: (evt, gestureState) => {
        this.moveCursor(evt)
      },
      onPanResponderMove: (evt, gestureState) => {
        this.moveCursor(evt)
      }
    })
  }

  moveCursor (evt) {
    if (this.props.onStreamTimeChange) {
      var streamTime = this.locationXToStreamTime(evt.nativeEvent.locationX)
      streamTime = Math.max(this.props.videoStreamStartTime, Math.min(streamTime, this.props.videoStreamEndTime))
      this.props.onStreamTimeChange(streamTime)
    }
  }

  onStreamTimeProgress (streamTime) {
    var v = this.streamTimeToLocationX(streamTime)
    if (this._timeline) {
      this._timeline.setNativeProps({
        x1: v.toString(),
        x2: v.toString()
      })
    }
    if (this._segmentEffortClipBox) {
      this._segmentEffortClipBox.setNativeProps({
        width: (v - this.videoStartX()).toString()
      })
    }
  }

  streamTimeToLocationX (streamTime) {
    var v = [streamTime, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, this.state.transform)
    return v[0]
  }

  locationXToStreamTime (locationX) {
    var v = [locationX, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, this.state.inverseTransform)
    return v[0]
  }

  componentWillUnmount () {
    if (this.onStreamTimeProgressSubscriber) {
      this.onStreamTimeProgressSubscriber.remove()
    }
  }

  componentDidMount () {
    this.updateTransform(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateTransform(nextProps)
  }

  streamTimeToOriginalX (streamTime) {
    var fraction = streamTime / this.lastTime()
    return fraction * this.state.width
  }

  firstTime () {
    return _.get(this.props, 'timeStream[0]', -1)
  }

  lastTime () {
    var lastIndex = (_.get(this.props, 'timeStream.length') || 0) - 1
    return _.get(this.props, `timeStream[${lastIndex}]`, 0.0) * 1.0
  }

  _onLayout (event) {
    var resize = this.state.width === 1
    var width = _.get(event, 'nativeEvent.layout.width') || 1
    var height = _.get(event, 'nativeEvent.layout.height') || 1
    var transform = this.calculateTransform(this.props, width, height)
    this.setState({
      width: width,
      height: height,
      transform: transform,
      inverseTransform: MatrixMath.inverse(transform)
    }, () => {
      if (resize) {
        this.initStreamPaths(this.props)
      }
    })
  }

  updateTransform (props) {
    var transform = this.calculateTransform(props, this.state.width, this.state.height)
    this.setState({
      transform: transform,
      inverseTransform: MatrixMath.inverse(transform)
    }, () => {
      this.initStreamPaths(props)
    })
  }

  calculateTransform (props, width, height) {
    return createBoundsTransform(props.timeStream, props.deltaTimeStream, 0, height, width, -height)
  }

  initStreamPaths (props) {
    var timeStream = props.timeStream
    var deltaTimeStream = props.deltaTimeStream
    var newStreams = interpolate({ times: timeStream, values: deltaTimeStream, density: 1000 })
    var newTimeStream = newStreams.times
    var newDeltaStream = newStreams.values

    var combinedPoints = mergeStreams(newTimeStream, newDeltaStream)
    combinedPoints.unshift([0, 0])
    combinedPoints.push([newTimeStream[newTimeStream.length - 1], 0])
    var points = transformPoints(combinedPoints, this.state.transform)

    this.setState({
      deltaTimePoints: points //streamToPoints(this.state.height, this.state.width, newStreams.times, newStreams.values)
    })
  }

  videoStartX () {
    return this.streamTimeToLocationX(this.props.videoStreamStartTime)
  }

  videoEndX () {
    return this.streamTimeToLocationX(this.props.videoStreamEndTime)
  }

  render () {
    var timeStream = this.props.timeStream
    var deltaTimeStream = this.props.deltaTimeStream

    var points = this.state.deltaTimePoints

    var minDeltaTimeIndex = minValueIndex(deltaTimeStream)
    var maxDeltaTimeIndex = maxValueIndex(deltaTimeStream)

    var min = linearIndex(minDeltaTimeIndex, timeStream)
    var max = linearIndex(maxDeltaTimeIndex, timeStream)

    var vector = [0, 0, 0, 1]
    vector[0] = min
    var minV = MatrixMath.multiplyVectorByMatrix(vector, this.state.transform)
    vector[0] = max
    var maxV = MatrixMath.multiplyVectorByMatrix(vector, this.state.transform)

    if (points) {
      var videoStartX = this.videoStartX()
      var videoEndX = this.videoEndX()

      var videoStartTime =
        <Line
          x1={videoStartX}
          y1={0}
          x2={videoStartX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />

      var videoEndTime =
        <Line
          x1={videoEndX}
          y1={0}
          x2={videoEndX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />

      var segmentEffortWidth = videoEndX - videoStartX
      var segmentEffortClip =
        <ClipPath id='segmentEffort'>
          <Rect
            ref={(ref) => { this._segmentEffortClipBox = ref }}
            x={videoStartX}
            y={0}
            width={segmentEffortWidth}
            height={this.state.height} />
        </ClipPath>
      var redClipPath =
        <ClipPath id='red'>
          <Rect y={points[0][1] - this.state.height} width={this.state.width} height={this.state.height} />
        </ClipPath>
      var greenClipPath =
        <ClipPath id='green'>
          <Rect y={points[0][1]} width={this.state.width} height={this.state.height} />
        </ClipPath>
      var redPath =
        <RacePath
          points={points}
          fill='red'
          clipPath='url(#red)' />
      var lightRedPath =
        <RacePath
          points={points}
          fill='pink'
          clipPath='url(#red)' />
      var greenPath =
        <RacePath
          points={points}
          fill='green'
          clipPath='url(#green)' />
      var lightGreenPath =
        <RacePath
          points={points}
          fill='lightgreen'
          clipPath='url(#green)' />

      var all =
        <G>
          {segmentEffortClip}
          {redClipPath}
          {greenClipPath}
          <G>
            {lightRedPath}
            {lightGreenPath}
          </G>
          <G clipPath='url(#segmentEffort)'>
            {redPath}
            {greenPath}
          </G>
          {videoStartTime}
          {videoEndTime}
        </G>
    }

    return (
      <Svg
        {...this._panResponder.panHandlers}
        onLayout={this._onLayout}
        backgroundColor={'white'}
        width={this.props.width}
        height={this.props.height}>
        {all}
        <Line
          ref={(ref) => { this._timeline = ref }}
          x1={0}
          y1={0}
          x2={0}
          y2={this.props.height}
          stroke={'red'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />
      </Svg>
    )
  }
}

RaceGraph.propTypes = {
  timeStream: PropTypes.array.isRequired,
  deltaTimeStream: PropTypes.array.isRequired,
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  eventEmitter: PropTypes.object,
  onStreamTimeChange: PropTypes.func,
  videoStreamStartTime: PropTypes.any,
  videoStreamEndTime: PropTypes.any
}
