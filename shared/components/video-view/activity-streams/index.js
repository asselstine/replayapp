import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Animated
} from 'react-native'
import Svg, {
  Line,
  ClipPath,
  Rect,
  G
} from 'react-native-svg'
import _ from 'lodash'
import { StreamPath } from './stream-path'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

const STRAVA_BRAND_COLOUR = '#fc4c02'
const STRAVA_BRAND_COLOUR_LIGHT = '#ffa078'
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
    this.translate = MatrixMath.createIdentityMatrix()
    this.moveCursor = _.throttle(this.moveCursor.bind(this), 20)
    this.setTransform = _.throttle(this.setTransform.bind(this), 20)
    this._onLayout = this._onLayout.bind(this)
    this.touches = {}
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
    this.responders = {
      onStartShouldSetResponder: () => { return true },
      onMoveShouldSetResponder: () => { return true },
      onResponderGrant: this.handleResponderGrant.bind(this),
      onResponderMove: this.handleResponderMove.bind(this),
      onResponderRelease: this.handleResponderRelease.bind(this),
      onResponderTerminate: this.handleResponderTerminate.bind(this),
      onResponderTerminationRequest: () => { return false }
    }
  }

  storeOriginalTouches (touches) {
    touches.forEach((touch) => {
      if (!this.touches[touch.identifier]) {
        this.touches[touch.identifier] = touch
        // console.log(`set ${touch.identifier}`)
      }
      if (!touch.touches) { return }
      touch.touches.forEach((secondaryTouch) => {
        if (secondaryTouch.identifier !== touch.identifier &&
            !this.touches[secondaryTouch.identifier]) {
          this.touches[secondaryTouch.identifier] = secondaryTouch
          // console.log(`set ${secondaryTouch.identifier}`)
        }
      })
    })
  }

  clearOldTouches (touches) {
    _.keys(this.touches).forEach((key) => {
      // console.log(`checking ${key} against ${_.map(touches, 'identifier')}`)
      if (_.findIndex(touches, {'identifier': +key}) === -1) {
        delete this.touches[key]
        // console.log(`cleared ${key}`)
      }
    })
  }

  handleResponderGrant (e, gestureState) {
    // console.log(`grant ${e.nativeEvent.identifier}`)
    this.storeOriginalTouches(e.nativeEvent.touches)
    this.allowMoveCursor = true
  }

  handleResponderMove (e, gestureState) {
    // console.log(`move ${e.nativeEvent.identifier} ${e.nativeEvent.touches.length}`)
    var oldTouchKeys = _.keys(this.touches)
    this.clearOldTouches(e.nativeEvent.touches)
    var touchKeys = _.keys(this.touches)
    if (oldTouchKeys.length > touchKeys.length) {
      // console.log('APPLY TRANSFORM')
      this.applyTransform()
    } else { // => oldTouchKeys <= touchKeys.length (recenter on change to 2)
      this.scaleCenterX = this.centerX(e.nativeEvent)
    }
    if (e.nativeEvent.touches.length === 2) {
      this.allowMoveCursor = false
      this.storeOriginalTouches(e.nativeEvent.touches)
      this.newTransform = MatrixMath.createIdentityMatrix()
      this.setTransform(this.translateAndScale(this.newTransform, e, gestureState))
      // NOTE: should only update if it's not playing
      var locationX = this.streamTimeToLocationX(this.streamTime)
      this.setCursorLocationX(locationX) // update cursor
    } else if (touchKeys.length === 1 && this.allowMoveCursor) {
      this.moveCursor(e.nativeEvent.touches[0].locationX)
    }
  }

  handleResponderRelease (e, gestureState) {
    this.applyTransform()
    this.touches = {}
  }

  applyTransform () {
    // console.log('apply transform start >>>>>>>>>>>')
    var identity = MatrixMath.createIdentityMatrix()
    this.setTransform(identity)
    var newTransform = this.state.transform.slice()
    MatrixMath.multiplyInto(newTransform, this.newTransform, this.state.transform)
    this.newTransform = identity
    this.setState({
      transform: newTransform
    })
    this.touches = {}
    // console.log('apply transform stop __________________')
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
    console.log(`cursor location: ${locationX}`)
    this.setCursorLocationX(locationX)
    this.moveClippingRectToLocationX(streamTime)
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
    console.log('moveClippingRectToLocationX')
    console.log(this.newTransform)
    console.log(this.state.transform)
    console.log(`rect x/width: ${clipOrigin}/${clipEnd}`)
  }

  combinedTransforms () {
    var matrix = this.state.transform.slice()
    // console.log(matrix, this.newTransform, this.state.transform)
    MatrixMath.multiplyInto(matrix, this.newTransform || IDENTITY, this.state.transform)
    return matrix
  }

  handleResponderTerminate (e, gestureState) {
    // console.log(`terminate ${e.nativeEvent.identifier}`)
  }

  translateAndScale (command, e, gestureState) {
    var translate

    var scale = this.scale(e.nativeEvent)
    var dx = this.deltaX(e.nativeEvent)

    translate = MatrixMath.createTranslate2d(dx, 0)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createTranslate2d(-this.scaleCenterX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseScaleXCommand(translate, scale)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseTranslate2dCommand(translate, this.scaleCenterX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    return command
  }

  centerX (nativeEvent, identifierSet) {
    var totalPageX = nativeEvent.touches.reduce((centerX, touch) => {
      return centerX + touch.locationX
    }, 0)
    return totalPageX / nativeEvent.touches.length
  }

  startSpreadX (nativeEvent) {
    var locationXs = _.map(nativeEvent.touches, (touch) => this.touches[touch.identifier].locationX)
    return Math.max(...locationXs) - Math.min(...locationXs)
  }

  spreadX (nativeEvent) {
    var locationXs = _.map(nativeEvent.touches, (touch) => touch.locationX)
    return Math.max(...locationXs) - Math.min(...locationXs)
  }

  deltaX (nativeEvent) {
    return _.reduce(nativeEvent.touches, (totalDeltaX, touch) => {
      return totalDeltaX + (touch.locationX - this.touches[touch.identifier].locationX)
    }, 0) / nativeEvent.touches.length
  }

  scale (nativeEvent) {
    var spreadX = this.spreadX(nativeEvent)
    var startSpreadX = this.startSpreadX(nativeEvent)
    if (startSpreadX === 0) {
      var _scale = 1
    } else {
      _scale = spreadX / (this.startSpreadX(nativeEvent) * 1.0)
    }
    return _scale
  }

  setTransform (matrix) {
    this.transformView.setNativeProps({ style: { transform: [{perspective: 1000}, { matrix: this.applyTransformOrigin(matrix) }] } })
  }

  applyTransformOrigin (matrix) {
    var translate = MatrixMath.createIdentityMatrix()
    var copy = matrix.slice()
    MatrixMath.reuseTranslate2dCommand(translate, (this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, matrix, translate)
    MatrixMath.reuseTranslate2dCommand(translate, -(this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, translate, copy)
    return copy
  }

  _onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width') || 1,
      height: _.get(event, 'nativeEvent.layout.height') || 1
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

  setCursorLocationX (locationX) {
    if (this._line) {
      this._line.setNativeProps({ x1: locationX.toString(), x2: locationX.toString() })
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

  render () {
    // console.log('RERENDEERRRRRRR')
    var y = 0

    if (_.get(this.props, 'streams.velocity_smooth')) {
      var velocityStreamPath =
        <StreamPath
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.velocity_smooth.data}
          transform={this.state.transform}
          fill={STRAVA_BRAND_COLOUR_LIGHT} />
      var velocityStreamCurrentTimePath =
        <StreamPath
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.velocity_smooth.data}
          transform={this.state.transform}
          fill={STRAVA_BRAND_COLOUR} />
      y += 100
    }

    if (_.get(this.props, 'streams.altitude')) {
      var altitudeStreamPath =
        <StreamPath
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.altitude.data}
          transform={this.state.transform}
          fill={STRAVA_BRAND_COLOUR_LIGHT} />
      var altitudeStreamCurrentTimePath =
        <StreamPath
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.altitude.data}
          transform={this.state.transform}
          fill={STRAVA_BRAND_COLOUR} />
    }

    var currentTimeLine =
      <CustomAnimated.Line
        ref={(ref) => { this._line = ref }}
        x1={0}
        y1={0}
        x2={0}
        y2={this.state.height}
        stroke={STRAVA_BRAND_COLOUR}
        strokeDasharray={[5, 5]}
        strokeWidth='1' />

    var clipOrigin = MatrixMath.multiplyVectorByMatrix([0, 0, 0, 1], this.state.transform)
    var clipWidth = this.streamTimeToLocationX(this.streamTime, this.state.transform) - clipOrigin[0]
    console.log('render')
    console.log(this.state.transform)

    return (
      <View
        {...this.responders}
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
          {currentTimeLine}
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
  activity: PropTypes.object.isRequired
}

ActivityStreams.defaultProps = {
  style: {
    flex: 1
  }
}
