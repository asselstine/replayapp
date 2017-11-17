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
import PinchZoomResponder from 'react-native-pinch-zoom-responder'
import { MatrixBounds } from '../../../../../../matrix-bounds'
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
  View,
  Animated
} from 'react-native'

const IDENTITY = MatrixMath.createIdentityMatrix()

export class RaceGraph extends Component {
  constructor (props) {
    super(props)
    this.moveTransform = IDENTITY
    this._onLayout = this._onLayout.bind(this)
    this.state = {
      height: 1,
      width: 1,
      transform: IDENTITY,
      boundsTransform: IDENTITY,
    }
    this.updateTransform = this.updateTransform.bind(this)
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)
  }

  componentWillMount () {
    if (this.props.eventEmitter) {
      this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
    }
    this.pinchZoomResponder = new PinchZoomResponder({
      onPinchZoomStart: () => {
      },

      onPinchZoomEnd: () => {
        this.applyTransform()
      },

      onResponderMove: (e, gestureState) => {
        if (gestureState) {
          this.moveTransform = gestureState.transform.slice()
          MatrixBounds.applyBoundaryTransformX(0, this.state.width, this.moveTransform, this.combinedTransforms())
          this.setTransform(this.moveTransform)
          this.updateCursorLocations()
        }
      }
    }, { transformY: false })
    this.handlers = {
      onStartShouldSetResponder: (evt) => true,
      onStartShouldSetResponderCapture: (evt) => true,
      onMoveShouldSetResponder: (evt) => true,
      onMoveShouldSetResponderCapture: (evt) => true,
      onResponderTerminationRequest: (evt) => false,
      onResponderGrant: (evt) => {
        if (this.props.onStreamTimeChangeStart) {
          console.log('startttttt')
          this.props.onStreamTimeChangeStart()
        }
        this.moveCursor(evt)
        this.pinchZoomResponder.handlers.onResponderGrant(evt)
      },
      onResponderRelease: (evt) => {
        if (this.props.onStreamTimeChangeEnd) {
          this.props.onStreamTimeChangeEnd()
        }
        this.pinchZoomResponder.handlers.onResponderRelease(evt)
      },
      onResponderMove: (evt) => {
        this.moveCursor(evt)
        this.pinchZoomResponder.handlers.onResponderMove(evt)
      }
    }
  }

  moveCursor (evt) {
    if (this.props.onStreamTimeChange) {
      var streamTime = this.locationXToStreamTime(evt.nativeEvent.locationX)
      streamTime = Math.max(this.props.videoStreamStartTime, Math.min(streamTime, this.props.videoStreamEndTime))
      this.props.onStreamTimeChange(streamTime)
    }
  }

  onStreamTimeProgress (streamTime) {
    this.streamTime = streamTime
    var v = this.streamTimeToLocationX(streamTime)
    if (this._timeline) {
      this._timeline.setNativeProps({
        x1: v.toString(),
        x2: v.toString()
      })
    }
    this.moveClippingRectToLocationX(streamTime)
  }

  combinedTransforms () {
    var matrix = this.state.transform.slice()
    MatrixMath.multiplyInto(matrix, this.moveTransform, this.state.transform)
    return matrix
  }

  streamTimeToLocationX (streamTime, transform) {
    var v = [streamTime, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, this.state.boundsTransform)
    v = MatrixMath.multiplyVectorByMatrix(v, transform || this.combinedTransforms())
    return v[0]
  }

  locationXToStreamTime (locationX) {
    var v = [locationX, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, MatrixMath.inverse(this.state.transform))
    v = MatrixMath.multiplyVectorByMatrix(v, MatrixMath.inverse(this.state.boundsTransform))
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
    this.setState({
      width: width,
      height: height,
    }, () => {
      if (resize) {
        this.initStreamPaths(this.props)
      }
    })
  }

  updateTransform (props) {
    this.initStreamPaths(props)
  }

  calculateTransform (props, width, height) {
    return createBoundsTransform(props.timeStream, props.deltaTimeStream, 0, height, width, -height)
  }

  initStreamPaths (props) {
    var timeStream = props.timeStream
    var deltaTimeStream = props.deltaTimeStream
    var newStreams = interpolate({ times: timeStream, values: deltaTimeStream, density: 1000 })
    var newTimeStream = newStreams.times
    var newDeltaTimeStream = newStreams.values

    var boundsTransform = createBoundsTransform(newStreams.times, newStreams.values, 0, this.state.height, this.state.width, -this.state.height)
    var deltaTimePoints = mergeStreams(newTimeStream, newDeltaTimeStream)
    deltaTimePoints.unshift([0, 0])
    deltaTimePoints.push([newTimeStream[newTimeStream.length - 1], 0])
    deltaTimePoints = transformPoints(deltaTimePoints, boundsTransform)

    this.setState({
      deltaTimePoints,
      boundsTransform
    })
  }

  videoStartX () {
    return this.streamTimeToLocationX(this.props.videoStreamStartTime)
  }

  videoEndX () {
    return this.streamTimeToLocationX(this.props.videoStreamEndTime)
  }

  addOriginTransformTo (matrix) {
    var translate = MatrixMath.createIdentityMatrix()
    var copy = matrix.slice()
    MatrixMath.reuseTranslate2dCommand(translate, (this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, matrix, translate)
    MatrixMath.reuseTranslate2dCommand(translate, -(this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, translate, copy)
    return copy
  }

  setTransform (matrix) {
    this.transformView.setNativeProps({ style: { transform: [{perspective: 1000}, { matrix: this.addOriginTransformTo(matrix) }] } })
  }

  updateCursorLocations () {
    this.setCursorLocationX(this._timeline, this.streamTimeToLocationX(this.streamTime))
    this.setCursorLocationX(this._videoStartLine, this.streamTimeToLocationX(this.props.videoStreamStartTime))
    this.setCursorLocationX(this._videoEndLine, this.streamTimeToLocationX(this.props.videoStreamEndTime))
    this.moveClippingRectToLocationX(this.streamTime)
  }

  moveClippingRectToLocationX (streamTime) {
    if (!this._segmentEffortClipBox) { return }
    var timelineX = this.streamTimeToLocationX(streamTime, this.state.transform)
    var videoStartX = this.streamTimeToLocationX(this.props.videoStreamStartTime, this.state.transform)
    this._segmentEffortClipBox.setNativeProps({
      width: (timelineX - videoStartX).toString()
    })
  }

  setCursorLocationX (cursor, locationX) {
    if (cursor) {
      cursor.setNativeProps({ x1: locationX.toString(), x2: locationX.toString() })
    }
  }

  applyTransform () {
    var identity = MatrixMath.createIdentityMatrix()
    this.setTransform(identity)
    var newTransform = this.state.transform.slice()
    MatrixMath.multiplyInto(newTransform, this.moveTransform, this.state.transform)
    this.moveTransform = identity
    this.setState({
      transform: newTransform
    })
  }

  render () {
    if (this.state.deltaTimePoints) {
      var points = transformPoints(this.state.deltaTimePoints, this.state.transform)
      var videoStartX = this.videoStartX()
      var videoEndX = this.videoEndX()

      var videoStartTime =
        <Line
          ref={(ref) => { this._videoStartLine = ref }}
          x1={videoStartX}
          y1={0}
          x2={videoStartX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />

      var videoEndTime =
        <Line
          ref={(ref) => { this._videoEndLine = ref }}
          x1={videoEndX}
          y1={0}
          x2={videoEndX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />

      var segmentEffortClip =
        <ClipPath id='segmentEffort'>
          <Rect
            ref={(ref) => { this._segmentEffortClipBox = ref }}
            x={videoStartX}
            y={0}
            width={0}
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
          <G
            clipPath='url(#segmentEffort)'>
            {redPath}
            {greenPath}
          </G>
        </G>
    }

    return (
      <View
        {...this.handlers}
        onLayout={this._onLayout}>
        <View
          ref={(ref) => { this.transformView = ref }}>
          <Svg
            backgroundColor={'white'}
            width={this.props.width}
            height={this.props.height}>
            {all}
          </Svg>
        </View>
        <Svg
          style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}
          height='100%'
          width='100%'>
          {videoStartTime}
          {videoEndTime}
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
      </View>
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
  onStreamTimeChangeStart: PropTypes.func,
  onStreamTimeChangeEnd: PropTypes.func,
  videoStreamStartTime: PropTypes.any,
  videoStreamEndTime: PropTypes.any
}
