import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Responder,
  Animated
} from 'react-native'
import Svg, {
  Line,
  G
} from 'react-native-svg'
import _ from 'lodash'
import { StreamPolyline } from './stream-polyline'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

const CustomAnimated = {
  Line: Animated.createAnimatedComponent(Line),
  G: Animated.createAnimatedComponent(G)
}

export class ActivityStreams extends PureComponent {
  constructor (props) {
    super(props)
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)

    this.transform = MatrixMath.createIdentityMatrix()
    this.command = MatrixMath.createIdentityMatrix()
    this.translate = MatrixMath.createIdentityMatrix()

    this._onLayout = this._onLayout.bind(this)
    this.touches = {}
    this.state = {
      width: 1,
      height: 1,
      lineXPos: new Animated.Value(0),
      scaleX: new Animated.Value(1),
      translateX: new Animated.Value(0)
    }
    this.state.lineXPos.addListener((x) => {
      this._line.setNativeProps({ x1: x.value.toString(), x2: x.value.toString() })
    })
  }

  componentWillMount () {
    this._subscription = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
    this.responders = {
      onStartShouldSetResponder: () => { console.log('start'); return true },
      onMoveShouldSetResponder: () => { console.log('move'); return true },
      onResponderGrant: this.handleResponderGrant.bind(this),
      onResponderMove: this.handleResponderMove.bind(this),
      onResponderRelease: this.handleResponderRelease.bind(this),
      onResponderTerminate: this.handleResponderTerminate.bind(this),
      onResponderTerminationRequest: () => { console.log('terminate request'); return false }
    }
  }

  storeOriginalTouches (touches) {
    touches.forEach((touch) => {
      if (!this.touches[touch.identifier]) {
        this.touches[touch.identifier] = touch
        console.log(`set ${touch.identifier}`)
      }
      if (!touch.touches) { return }
      touch.touches.forEach((secondaryTouch) => {
        if (secondaryTouch.identifier !== touch.identifier &&
            !this.touches[secondaryTouch.identifier]) {
          this.touches[secondaryTouch.identifier] = secondaryTouch
          console.log(`set ${secondaryTouch.identifier}`)
        }
      })
    })
  }

  handleResponderGrant (e, gestureState) {
    console.log(`grant ${e.nativeEvent.identifier}`)
    this.storeOriginalTouches(e.nativeEvent.touches)
  }

  handleResponderMove (e, gestureState) {
    console.log(`move ${e.nativeEvent.identifier}`)
    if (e.nativeEvent.touches.length === 2) {
      this.storeOriginalTouches(e.nativeEvent.touches)
      this.command = MatrixMath.createIdentityMatrix()
      this.setTransform(this.translateAndScale(this.command, e, gestureState))
    }
  }

  handleResponderRelease (e, gestureState) {
    this.transform = this.command
    this.touches = {}
    console.log(`release ${e.nativeEvent.touches.length}`)
  }

  handleResponderTerminate (e, gestureState) {
    console.log(`terminate ${e.nativeEvent.identifier}`)
  }

  translateAndScale (command, e, gestureState) {
    var translate

    var scale = this.scale(e.nativeEvent)
    var dx = this.deltaX(e.nativeEvent)
    var centerX = this.centerX(e.nativeEvent)

    centerX -= (this.state.width / 2.0)

    translate = MatrixMath.createTranslate2d(dx, 0)
    MatrixMath.multiplyInto(command, translate, this.transform)
    // console.log(e.nativeEvent)

    translate = MatrixMath.createTranslate2d(-centerX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseScaleXCommand(translate, scale)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseTranslate2dCommand(translate, centerX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    return command
  }

  startCenterX (nativeEvent) {
    var totalPageX = nativeEvent.touches.reduce((centerX, touch) => centerX + this.touches[touch.identifier].pageX, 0)
    return totalPageX / nativeEvent.touches.length
  }

  centerX (nativeEvent) {
    var totalPageX = nativeEvent.touches.reduce((centerX, touch) => centerX + touch.pageX, 0)
    return totalPageX / nativeEvent.touches.length
  }

  startSpreadX (nativeEvent) {
    var pageXs = _.map(nativeEvent.touches, (touch) => this.touches[touch.identifier].pageX)
    return Math.max(...pageXs) - Math.min(...pageXs)
  }

  spreadX (nativeEvent) {
    var pageXs = _.map(nativeEvent.touches, (touch) => touch.pageX)
    return Math.max(...pageXs) - Math.min(...pageXs)
  }

  deltaX (nativeEvent) {
    return this.centerX(nativeEvent) - this.startCenterX(nativeEvent)
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
    this.viewRef.setNativeProps({ style: { transform: [{perspective: 1000}, { matrix: matrix.slice() }] } })
  }

  _onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width') || 1,
      height: _.get(event, 'nativeEvent.layout.height') || 1
    })
  }

  onStreamTimeProgress (streamTime) {
    if (this.lastAnimation) { this.lastAnimation.stop() }
    this.lastAnimation = Animated.timing(
      this.state.lineXPos,
      {
        toValue: this.streamTimeToX(streamTime),
        duration: 20
      }
    )
    this.lastAnimation.start()
  }

  streamTimeToX (streamTime) {
    var fraction = streamTime / this.lastTime()
    return this.state.width * fraction
  }

  xToStreamTime (x) {
    return (x / this.state.width) * this.lastTime()
  }

  lastTime () {
    var lastIndex = (_.get(this.props, 'streams.time.data.length') || 0) - 1
    return _.get(this.props, `streams.time.data[${lastIndex}]`, 0.0) * 1.0
  }

  render () {
    var y = 0

    if (_.get(this.props, 'streams.velocity_smooth')) {
      var velocityStreamPolyline =
        <StreamPolyline
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.velocity_smooth.data} />
      y += 100
    }

    if (_.get(this.props, 'streams.altitude')) {
      var altitudeStreamPolyline =
        <StreamPolyline
          width={this.state.width}
          y={y}
          height={100}
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.altitude.data} />
    }

    var currentTimeLine =
      <CustomAnimated.Line
        ref={(ref) => { this._line = ref }}
        x1={0}
        y1={0}
        x2={0}
        y2={this.state.height}
        stroke='red'
        strokeWidth='4' />

    return (
      <View
        ref={(ref) => { this.viewRef = ref }}
        {...this.responders}
        style={this.props.style}>
        <Svg
          height='200'
          width='100%'
          onLayout={this._onLayout}>
          <CustomAnimated.G
            x={this.state.translateX}>
            {velocityStreamPolyline}
            {altitudeStreamPolyline}
            {currentTimeLine}
          </CustomAnimated.G>
        </Svg>
      </View>
    )
  }
}

ActivityStreams.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
  style: PropTypes.object,
  streamTime: PropTypes.number,
  onStreamTimeChange: PropTypes.func,
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
