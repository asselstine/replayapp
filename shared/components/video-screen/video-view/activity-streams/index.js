import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Animated
} from 'react-native'
import {
  interpolate
} from '../../../../streams'
import Svg, {
  Line,
  ClipPath,
  Rect,
  G
} from 'react-native-svg'
import { TextLayer } from './text-layer'
import _ from 'lodash'
import { StreamPath } from '../../../stream-path'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import { Activity } from '../../../../activity'
import * as colours from '../../../../colours'
import { PinchZoomResponder } from './pinch-zoom-responder'
import {
  streamToPoints,
  transformStreamPointsToPath
} from '../../../../svg'

const IDENTITY = MatrixMath.createIdentityMatrix()

const CustomAnimated = {
  Line: Animated.createAnimatedComponent(Line)
}

export class ActivityStreams extends PureComponent {
  constructor (props) {
    super(props)
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)
    this.streamTime = 0
    this.newTransform = MatrixMath.createIdentityMatrix()
    this.resizeToVideo = this.resizeToVideo.bind(this)
    this.moveCursor = _.throttle(this.moveCursor.bind(this), 20)
    this.setTransform = _.throttle(this.setTransform.bind(this), 20)
    this._onLayout = this._onLayout.bind(this)
    this.state = {
      width: 1,
      height: 1,
      lineXPos: new Animated.Value(0),
      transform: MatrixMath.createIdentityMatrix()
    }
    this.state.lineXPos.addListener((x) => {
      this.setCursorLocationX(x.value)
    })
  }

  componentWillMount () {
    this._subscription = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
    this.pinchZoomResponder = new PinchZoomResponder({
      onPinchZoomStart: (e) => {
      },

      onPinchZoomEnd: (e) => {
        this.applyTransform()
      },

      onResponderMove: (e, gestureState) => {
        var touchKeys = _.keys(e.nativeEvent.touches)
        if (gestureState.transform) {
          this.newTransform = gestureState.transform.slice()
          this.addBoundaryTransformTo(this.newTransform)
          this.setTransform(this.newTransform)
          // NOTE: should only update if it's not playing
          this.updateCursorLocation()
        }
        if (touchKeys.length === 1) {
          var locationX = e.nativeEvent.touches[0].locationX
          this.moveCursor(locationX)
        }
      },
    })
  }

  componentWillReceiveProps (nextProps) {
    this.initStreamPaths()
  }

  applyTransform () {
    var identity = MatrixMath.createIdentityMatrix()
    this.setTransform(identity)
    var newTransform = this.state.transform.slice()
    MatrixMath.multiplyInto(newTransform, this.newTransform, this.state.transform)
    this.newTransform = identity
    this.setState({
      transform: newTransform
    })
  }

  moveCursor (locationX) {
    if (this.props.onStreamTimeChange) {
      var streamTime = this.locationXToStreamTime(locationX)
      this.props.onStreamTimeChange(streamTime)
    }
  }

  onStreamTimeProgress (streamTime) {
    this.streamTime = streamTime
    var locationX = this.streamTimeToLocationX(streamTime)
    this.setCursorLocationX(this._line, locationX)
    this.moveClippingRectToLocationX(streamTime)
    this.updateStreamLabels(streamTime)
  }

  updateStreamLabels (streamTime) {
    if (this._textLayer) {
      this._textLayer.updateText(
        `${this.timeToCurrentKmh(streamTime)} Km/h`,
        `${this.timeToCurrentAltitude(streamTime)} metres`
      )
    }
  }

  moveClippingRectToLocationX (streamTime) {
    if (!this._timeClippingRect) { return }
    var originalEnd = this.streamTimeToOriginalX(streamTime)
    var transform = this.state.transform
    var clipOrigin = MatrixMath.multiplyVectorByMatrix([0, 0, 0, 1], transform)[0]
    var clipEnd = MatrixMath.multiplyVectorByMatrix([originalEnd, 0, 0, 1], transform)[0]
    this._timeClippingRect.setNativeProps({
      x: clipOrigin.toString(),
      width: (clipEnd - clipOrigin).toString()
    })
  }

  combinedTransforms () {
    var matrix = this.state.transform.slice()
    MatrixMath.multiplyInto(matrix, this.newTransform || IDENTITY, this.state.transform)
    return matrix
  }

  setTransform (matrix) {
    this.transformView.setNativeProps({ style: { transform: [{perspective: 1000}, { matrix: this.addOriginTransformTo(matrix) }] } })
  }

  addBoundaryTransformTo (matrix) {
    var completeTransform = this.combinedTransforms()
    // console.log(completeTransform)

    // Fix the scale
    if (completeTransform[0] < 1) {
      var minScale = MatrixMath.createIdentityMatrix()
      minScale[0] = 1.0 / completeTransform[0]
      MatrixMath.multiplyInto(matrix, minScale, matrix)
    }
    // Update current complete matrix
    MatrixMath.multiplyInto(completeTransform, matrix, this.state.transform)

    // Fix the origin
    var originDifference = MatrixMath.multiplyVectorByMatrix([0, 0, 0, 1], completeTransform)
    if (originDifference[0] > 0) {
      MatrixMath.multiplyInto(matrix, MatrixMath.createTranslate2d(-originDifference[0], 0), matrix)
    }

    // Update current complete matrix
    MatrixMath.multiplyInto(completeTransform, matrix, this.state.transform)

    // Fix the end
    var endPointDifference = MatrixMath.multiplyVectorByMatrix([this.state.width, 0, 0, 1], completeTransform)
    var diff = endPointDifference[0] - this.state.width
    if (diff < 0) {
      MatrixMath.multiplyInto(matrix, MatrixMath.createTranslate2d(-diff, 0), matrix)
    }

    return matrix
  }

  resizeToVideo (props) {
    var times = _.get(props, 'streams.time.data')
    if (!(times && props.videoStreamStartTime && props.videoStreamEndTime && this.state.width > 1)) { return }

    if (props.videoStreamStartTime === props.videoStreamEndTime) { return }

    var matrix = this.newTransform
    var completeTransform = this.combinedTransforms()
    // duration / length
    var bestScale = (times[times.length - 1] - times[0]) / (props.videoStreamEndTime - props.videoStreamStartTime)
    // Fix the scale
    if (completeTransform[0] !== bestScale) {
      var reScale = MatrixMath.createIdentityMatrix()
      reScale[0] = bestScale / completeTransform[0]
      MatrixMath.multiplyInto(matrix, reScale, matrix)
    }
    // Update current complete matrix
    MatrixMath.multiplyInto(completeTransform, matrix, this.state.transform)

    var originalX = this.streamTimeToOriginalX(props.videoStreamStartTime)
    // Fix the origin
    var originDifference = MatrixMath.multiplyVectorByMatrix([originalX, 0, 0, 1], completeTransform)
    MatrixMath.multiplyInto(matrix, MatrixMath.createTranslate2d(-originDifference[0], 0), matrix)

    this.applyTransform()
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

  _onLayout (event) {
    var resize = this.state.width === 1
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width') || 1,
      height: _.get(event, 'nativeEvent.layout.height') || 1
    }, () => {
      if (resize) { // then it hasn't been initialized
        this.initStreamPaths()
        this.updateCursorLocation()
        this.resizeToVideo(this.props)
      }
    })
  }

  animateCursorToLocationX (locationX) {
    if (this.lastAnimation) { this.lastAnimation.stop() }
    this.lastAnimation = Animated.timing(
      this.state.lineXPos,
      {
        toValue: locationX,
        duration: 20
      }
    )
    this.lastAnimation.start()
  }

  updateCursorLocation () {
    this.setCursorLocationX(this._line, this.streamTimeToLocationX(this.streamTime))
    this.setCursorLocationX(this._videoStartTime, this.streamTimeToLocationX(this.props.videoStreamStartTime))
    this.setCursorLocationX(this._videoEndTime, this.streamTimeToLocationX(this.props.videoStreamEndTime))
  }

  setCursorLocationX (cursor, locationX) {
    if (cursor) {
      cursor.setNativeProps({ x1: locationX.toString(), x2: locationX.toString() })
    }
  }

  streamTimeToOriginalX (streamTime) {
    var fraction = streamTime / this.lastTime()
    return fraction * this.state.width
  }

  streamTimeToLocationX (streamTime, transform) {
    var originalX = this.streamTimeToOriginalX(streamTime)
    var v = [originalX, 0, 0, 1]
    var newV = MatrixMath.multiplyVectorByMatrix(v, transform || this.combinedTransforms())
    return newV[0]
  }

  locationXToStreamTime (locationX) {
    var v = [locationX, 0, 0, 1]
    var newV = MatrixMath.multiplyVectorByMatrix(v, MatrixMath.inverse(this.state.transform))
    var fraction = Math.max(0, Math.min(1, newV[0] / this.state.width))
    var streamTime = fraction * this.lastTime()
    return streamTime
  }

  lastTime () {
    var lastIndex = (_.get(this.props, 'streams.time.data.length') || 0) - 1
    return _.get(this.props, `streams.time.data[${lastIndex}]`, 0.0) * 1.0
  }

  timeToCurrentKmh (streamTime) {
    return Activity.velocityAt(this.props.streams, streamTime)
  }

  timeToCurrentAltitude (streamTime) {
    return Activity.altitudeAt(this.props.streams, streamTime)
  }

  initStreamPaths () {
    var timeData = _.get(this.props, 'streams.time.data', [])
    var velocityData = _.get(this.props, 'streams.velocity_smooth.data', [])
    var altitudeData = _.get(this.props, 'streams.altitude.data', [])
    var newVelocity = interpolate({ times: timeData, values: velocityData })
    var newAltitude = interpolate({ times: timeData, values: altitudeData })

    this.setState({
      velocityPath: streamToPoints(80, this.state.width, newVelocity.times, newVelocity.values),
      altitudePath: streamToPoints(80, this.state.width, newAltitude.times, newAltitude.values),
    })
  }

  render () {
    var y = 0

    if (this.state.velocityPath) {
      var velocityPath = transformStreamPointsToPath(this.state.velocityPath, this.state.transform)
      var velocityStreamPath =
        <StreamPath
          y={y + 20}
          d={velocityPath}
          fill={colours.STRAVA_BRAND_COLOUR_LIGHT} />
      var velocityStreamCurrentTimePath =
        <StreamPath
          y={y + 20}
          d={velocityPath}
          fill={colours.STRAVA_BRAND_COLOUR} />
      y += 100
    }

    var altitudeStreamPath, altitudeStreamCurrentTimePath

    if (this.state.altitudePath) {
      var altitudePath = transformStreamPointsToPath(this.state.altitudePath, this.state.transform)
      altitudeStreamPath =
        <StreamPath
          y={y + 20}
          d={altitudePath}
          fill={colours.STRAVA_BRAND_COLOUR_LIGHT} />
      altitudeStreamCurrentTimePath =
        <StreamPath
          y={y + 20}
          d={altitudePath}
          fill={colours.STRAVA_BRAND_COLOUR} />
    }

    var currentTimeLine, videoStartTime, videoEndTime

    currentTimeLine =
      <CustomAnimated.Line
        ref={(ref) => { this._line = ref }}
        x1={this.streamTimeToLocationX(this.streamTime)}
        y1={0}
        x2={this.streamTimeToLocationX(this.streamTime)}
        y2={this.state.height}
        stroke={colours.STRAVA_BRAND_COLOUR}
        strokeDasharray={[5, 5]}
        strokeWidth='1' />

    videoStartTime =
      <CustomAnimated.Line
        ref={(ref) => { this._videoStartTime = ref }}
        x1={this.streamTimeToLocationX(this.props.videoStreamStartTime)}
        y1={0}
        x2={this.streamTimeToLocationX(this.props.videoStreamStartTime)}
        y2={this.state.height}
        stroke={'black'}
        strokeDasharray={[5, 5]}
        strokeWidth='1' />

    videoEndTime =
      <CustomAnimated.Line
        ref={(ref) => { this._videoEndTime = ref }}
        x1={this.streamTimeToLocationX(this.props.videoStreamEndTime)}
        y1={0}
        x2={this.streamTimeToLocationX(this.props.videoStreamEndTime)}
        y2={this.state.height}
        stroke={'black'}
        strokeDasharray={[5, 5]}
        strokeWidth='1' />

    var clipOrigin = MatrixMath.multiplyVectorByMatrix([0, 0, 0, 1], this.state.transform)
    var clipWidth = this.streamTimeToLocationX(this.streamTime, this.state.transform) - clipOrigin[0]
    // console.log(`videoStreamEndTime: ${this.props.videoStreamEndTime}`)

    return (
      <View
        {...this.pinchZoomResponder.handlers}
        style={this.props.style}
        onLayout={this._onLayout}>
        <View
          ref={(ref) => { this.transformView = ref }}>
          <Svg
            height='200'
            width='100%'>
            <ClipPath id='timeClip'>
              <Rect
                ref={(ref) => { this._timeClippingRect = ref }}
                x={clipOrigin.toString()}
                y={0}
                width={clipWidth}
                height='200' />
            </ClipPath>
            <G>
              {velocityStreamPath}
              {altitudeStreamPath}
            </G>
            <G clipPath='url(#timeClip)'>
              {velocityStreamCurrentTimePath}
              {altitudeStreamCurrentTimePath}
            </G>
          </Svg>
        </View>
        <Svg
          style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}
          height='200'
          width='100%'>
          {videoStartTime}
          {videoEndTime}
          {currentTimeLine}
          <TextLayer
            ref={(ref) => { this._textLayer = ref }}
            velocityText='0 Km/h'
            altitudeText='0m'
            velocityY={0}
            altitudeY={100} />
        </Svg>
      </View>
    )
  }
}

ActivityStreams.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
  style: PropTypes.object,
  onStreamTimeChange: PropTypes.func,
  streams: PropTypes.object,
  activity: PropTypes.object.isRequired,
  videoStreamStartTime: PropTypes.any,
  videoStreamEndTime: PropTypes.any
}

ActivityStreams.defaultProps = {
  style: {
    flex: 1
  }
}
