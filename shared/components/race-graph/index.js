import React, {
  Component,
  PureComponent,
} from 'react'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'
import formatSplit from '../../format-split'
import { ActiveText } from '../active-text'
import { ActiveRefs } from '../../active-refs'
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
import { MatrixBounds } from '../../matrix-bounds'
import {
  mergeStreams,
  streamToPoints,
  pointsToPath,
  transformPoints
} from '../../svg'
import {
  interpolate,
  linear,
  linearIndex,
  minValueIndex,
  maxValueIndex,
  createBoundsTransform
} from '../../streams'
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
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)
    this.activeRefs = new ActiveRefs()
    this.streamTime = 0
  }

  componentWillMount () {
    if (this.props.eventEmitter) {
      this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('progressActivityTime', this.onStreamTimeProgress)
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
    this.wasTwoFingers = false
    this.handlers = {
      onStartShouldSetResponder: (evt) => true,
      onStartShouldSetResponderCapture: (evt) => true,
      onMoveShouldSetResponder: (evt) => true,
      onMoveShouldSetResponderCapture: (evt) => true,
      onResponderTerminationRequest: (evt) => false,
      onResponderGrant: (evt) => {
        if (this.props.onStreamTimeChangeStart) {
          this.props.onStreamTimeChangeStart()
        }
        this.wasTwoFingers = this.wasTwoFingers || evt.nativeEvent.touches.length > 1
        this.pinchZoomResponder.handlers.onResponderGrant(evt)
      },
      onResponderRelease: (evt) => {
        if (this.props.onStreamTimeChangeEnd) {
          this.props.onStreamTimeChangeEnd()
        }
        this.pinchZoomResponder.handlers.onResponderRelease(evt)
        if (!this.wasTwoFingers) {
          this.moveCursor(evt.nativeEvent.locationX)
        }
        this.wasTwoFingers = false
        this.oneFingerTimeout = false
      },
      onResponderMove: (evt) => {
        this.wasTwoFingers = this.wasTwoFingers || evt.nativeEvent.touches.length > 1
        if (!this.wasTwoFingers) {
          if (this.oneFingerTimeout) {
            this.moveCursor(evt.nativeEvent.locationX)
          } else {
            this.startOneFingerTimeout(evt.nativeEvent.locationX)
          }
        }
        this.pinchZoomResponder.handlers.onResponderMove(evt)
      }
    }
  }

  startOneFingerTimeout (locationX) {
    this.oneFingerTimeout = false
    this.cursorTimeout = this.setTimeout(() => {
      if (!this.wasTwoFingers) {
        this.oneFingerTimeout = true
      }
    }, 100)
  }

  propsHaveChanged (nextProps) {
    var props = ['timeStream', 'deltaTimeStream', 'width', 'height', 'videoStreamStartTime', 'videoStreamEndTime']
    for (var i in props) {
      if (!_.isEqual(nextProps[props[i]], this.props[props[i]])) {
        return true
      }
    }
    return false
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.propsHaveChanged(nextProps)) { return true }
    var state = ['width', 'height', 'transform', 'boundsTransform']
    for (var i in state) {
      if (!_.isEqual(nextState[state[i]], this.state[state[i]])) {
        return true
      }
    }

    return false
  }

  moveCursor (locationX) {
    if (this.props.onStreamTimeChange) {
      var streamTime = this.locationXToStreamTime(locationX)
      streamTime = Math.max(this.props.videoStreamStartTime, Math.min(streamTime, this.props.videoStreamEndTime))
      this.props.onStreamTimeChange(streamTime)
    }
  }

  onStreamTimeProgress (streamTime) {
    this.streamTime = streamTime
    var v = this.streamTimeToLocationX(streamTime)
    this.activeRefs.onStreamTimeProgress(streamTime)
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

  streamTimeToOriginalX (streamTime, transform = this.state.boundsTransform) {
    var v = [streamTime, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, transform)
    return v[0]
  }

  streamTimeToLocationX (streamTime, transform) {
    var v = [this.streamTimeToOriginalX(streamTime), 0, 0, 1]
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
    this.initStreamPaths(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (this.propsHaveChanged(nextProps)) {
      this.initStreamPaths(nextProps)
    }
  }

  _onLayout (event) {
    var width = _.get(event, 'nativeEvent.layout.width') || 1
    var height = _.get(event, 'nativeEvent.layout.height') || 1
    this.setState({
      width,
      height
    }, () => {
      this.initStreamPaths(this.props)
    })
  }

  createInitialTransform (boundsTransform) {
    var times = this.props.timeStream
    if (!(times && this.props.videoStreamStartTime && this.props.videoStreamEndTime && this.state.width > 1)) { return }
    if (this.props.videoStreamStartTime === this.props.videoStreamEndTime) { return }

    var segmentDuration = times[times.length - 1] - times[0]
    var boundedVideoStart = Math.max(this.props.videoStreamStartTime, times[0])
    var boundedVideoEnd = Math.min(this.props.videoStreamEndTime, times[times.length - 1])
    var videoDuration = boundedVideoEnd - boundedVideoStart
    var bestScale = segmentDuration / videoDuration

    var origin = this.streamTimeToOriginalX(boundedVideoStart, boundsTransform)
    var translate = MatrixMath.createTranslate2d(-origin, 0)
    var scale = MatrixMath.createIdentityMatrix()
    scale[0] = bestScale
    MatrixMath.multiplyInto(translate, scale, translate)

    return translate
  }

  initStreamPaths (props) {
    this.setState(this.calculate(props.timeStream, props.deltaTimeStream))
  }

  calculate (timeStream, deltaTimeStream) {
    var newStreams = interpolate({ times: timeStream, values: deltaTimeStream, density: 1000 })
    var newTimeStream = newStreams.times
    var newDeltaTimeStream = newStreams.values

    var boundsTransform = createBoundsTransform(newStreams.times, newStreams.values, 0, this.state.height, this.state.width, -this.state.height)
    var deltaTimePoints = mergeStreams(newTimeStream, newDeltaTimeStream)
    deltaTimePoints.unshift([0, 0])
    deltaTimePoints.push([newTimeStream[newTimeStream.length - 1], 0])
    deltaTimePoints = transformPoints(deltaTimePoints, boundsTransform)

    var transform = this.createInitialTransform(boundsTransform)

    var result = {
      deltaTimePoints,
      boundsTransform
    }
    if (transform) {
      // console.log('Made transform')
      result.transform = transform
    } else {
      // console.log('Transform not possible')
    }
    return result
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
    this.activeRefs.clear()
    if (this.state.deltaTimePoints && this.state.transform) {
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

    if (this.props.showLabel) {
      var label =
        <ActiveText
          ref={(ref) => this.activeRefs.add(ref)}
          style={styles.label}
          streamTime={this.streamTime}
          format={(streamTime) => {
            var interp = linear(streamTime, this.props.timeStream, this.props.deltaTimeStream) * 1000
            return formatSplit(interp)
          }} />
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
        {label}
      </View>
    )
  }

  logProps (props) {
    console.log('PROPS::::::::::::::::::::::::::::::')
    console.log(props.timeStream.length)
    console.log(props.deltaTimeStream.length)
    console.log(props.width)
    console.log(props.height)
    console.log(props.eventEmitter)
    console.log(props.onStreamTimeChange)
    console.log(props.onStreamTimeChangeStart)
    console.log(props.onStreamTimeChangeEnd)
    console.log(props.videoStreamStartTime)
    console.log(props.videoStreamEndTime)
    console.log('____________________________')
  }
}

RaceGraph.propTypes = {
  timeStream: PropTypes.array.isRequired,
  deltaTimeStream: PropTypes.array.isRequired,
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  videoStreamStartTime: PropTypes.any,
  videoStreamEndTime: PropTypes.any,
  eventEmitter: PropTypes.object,
  onStreamTimeChange: PropTypes.func,
  onStreamTimeChangeStart: PropTypes.func,
  onStreamTimeChangeEnd: PropTypes.func,
  showLabel: PropTypes.bool
}

reactMixin(RaceGraph.prototype, TimerMixin)

const styles = {
  label: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'black',
    fontSize: 14,
    fontWeight: '700'
  }
}
