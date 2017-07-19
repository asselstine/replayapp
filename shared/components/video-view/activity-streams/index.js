import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View,
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
    this.moveCursor = _.throttle(this.moveCursor.bind(this), 50)
    this.setTransform = _.throttle(this.setTransform.bind(this), 50)

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
    console.log(`grant ${e.nativeEvent.identifier}`)
    this.storeOriginalTouches(e.nativeEvent.touches)
    if (e.nativeEvent.touches.length === 1) {
      this.moveCursor(e.nativeEvent.touches[0].locationX)
    }
  }

  handleResponderMove (e, gestureState) {
    // console.log(`move ${e.nativeEvent.identifier}`)
    this.clearOldTouches(e.nativeEvent.touches)
    if (e.nativeEvent.touches.length === 2) {
      this.storeOriginalTouches(e.nativeEvent.touches)
      this.command = MatrixMath.createIdentityMatrix()
      this.setTransform(this.translateAndScale(this.command, e, gestureState))
      // this.onStreamTimeProgress(this.streamTime) // update cursor
    } else {
      this.moveCursor(e.nativeEvent.touches[0].locationX)
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

  moveCursor (locationX) {
    if (this.props.onStreamTimeChange) {
      this.props.onStreamTimeChange(this.locationXToStreamTime(locationX))
    }
  }

  onStreamTimeProgress (streamTime) {
    this.streamTime = streamTime
    if (this.lastAnimation) { this.lastAnimation.stop() }
    this.lastAnimation = Animated.timing(
      this.state.lineXPos,
      {
        toValue: this.streamTimeToLocationX(streamTime),
        duration: 20
      }
    )
    this.lastAnimation.start()
  }

  streamTimeToLocationX (streamTime) {
    var fraction = streamTime / this.lastTime()
    var worldX = fraction * this.state.width
    var v = [worldX, 0, 0, 1]
    var newV = MatrixMath.multiplyVectorByMatrix(v, this.transform)
    return newV[0]
  }

  locationXToStreamTime (locationX) {
    var v = [locationX, 0, 0, 1]
    var newV = MatrixMath.multiplyVectorByMatrix(v, MatrixMath.inverse(this.command))
    var fraction = Math.max(0, Math.min(1, newV[0] / this.state.width))
    var streamTime = fraction * this.lastTime()
    return streamTime
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
        {...this.responders}
        style={this.props.style}
        onLayout={this._onLayout}>
        <View
          ref={(ref) => { this.transformView = ref }}>
          <Svg
            height='200'
            width='100%'>
            <CustomAnimated.G
              x={this.state.translateX}>
              {velocityStreamPolyline}
              {altitudeStreamPolyline}
            </CustomAnimated.G>
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
