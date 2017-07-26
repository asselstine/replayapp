import React, {
  Component
} from 'react'
import {
  Svg,
  ClipPath,
  Line,
  Rect
} from 'react-native-svg'
import { RacePath } from './race-path'
import _ from 'lodash'
import PropTypes from 'prop-types'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import {
  mergeStreams,
  transformPoints
} from '../../../../svg'
import {
  linearIndex,
  minValueIndex,
  maxValueIndex,
  createBoundsTransform
} from '../../../../streams'
import { InfoLine } from './info-line'
import {
  PanResponder
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
    this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
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
    var v = [evt.nativeEvent.locationX, 0, 0, 1]
    v = MatrixMath.multiplyVectorByMatrix(v, this.state.inverseTransform)
    if (this.props.onStreamTimeChange) {
      console.log(`move: ${evt.nativeEvent.locationX} ${v[0]}`)
      this.props.onStreamTimeChange(v[0])
    }
  }

  onStreamTimeProgress (streamTime) {
    if (this._timeline) {
      var v = [streamTime, 0, 0, 1]
      v = MatrixMath.multiplyVectorByMatrix(v, this.state.transform)
      // console.log(streamTime, v[0])
      this._timeline.setNativeProps({
        x1: v[0].toString(),
        x2: v[0].toString()
      })
    }
  }

  componentWillUnmount () {
    this.onStreamTimeProgressSubscriber.remove()
  }

  componentDidMount () {
    this.updateTransform(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateTransform(nextProps)
  }

  _onLayout (event) {
    var width = _.get(event, 'nativeEvent.layout.width') || 1
    var height = _.get(event, 'nativeEvent.layout.height') || 1
    var transform = this.calculateTransform(this.props, width, height)
    this.setState({
      width: width,
      height: height,
      transform: transform,
      inverseTransform: MatrixMath.inverse(transform)
    })
  }

  updateTransform (props) {
    var transform = this.calculateTransform(props, this.state.width, this.state.height)
    this.setState({
      transform: transform,
      inverseTransform: MatrixMath.inverse(transform)
    })
  }

  calculateTransform (props, width, height) {
    return createBoundsTransform(props.timeStream, props.deltaTimeStream, 0, height, width, -height)
  }

  render () {
    var timeStream = this.props.timeStream
    var deltaTimeStream = this.props.deltaTimeStream

    var combinedPoints = mergeStreams(timeStream, deltaTimeStream)
    combinedPoints.unshift([0, 0])
    combinedPoints.push([timeStream[timeStream.length - 1], 0])
    var points = transformPoints(combinedPoints, this.state.transform)

    var minDeltaTimeIndex = minValueIndex(deltaTimeStream)
    var maxDeltaTimeIndex = maxValueIndex(deltaTimeStream)

    var min = linearIndex(minDeltaTimeIndex, timeStream)
    var max = linearIndex(maxDeltaTimeIndex, timeStream)

    var vector = [0, 0, 0, 1]
    vector[0] = min
    var minV = MatrixMath.multiplyVectorByMatrix(vector, this.state.transform)
    vector[0] = max
    var maxV = MatrixMath.multiplyVectorByMatrix(vector, this.state.transform)

    return (
      <Svg
        {...this._panResponder.panHandlers}
        onLayout={this._onLayout}
        backgroundColor={'white'}
        width={this.props.width}
        height={this.props.height}>
        <ClipPath id='red'>
          <Rect y={points[0][1] - this.state.height} width={this.state.width} height={this.state.height} />
        </ClipPath>
        <ClipPath id='green'>
          <Rect y={points[0][1]} width={this.state.width} height={this.state.height} />
        </ClipPath>
        <RacePath
          points={points}
          stroke={'red'}
          fill='red'
          clipPath='url(#red)' />
        <RacePath
          points={points}
          fill='green'
          clipPath='url(#green)' />
        <InfoLine
          label={`${deltaTimeStream[minDeltaTimeIndex]}s`}
          x={minV[0]}
          height={this.state.height} />
        <InfoLine
          label={`${deltaTimeStream[maxDeltaTimeIndex]}s`}
          x={maxV[0]}
          height={this.state.height} />
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
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func
}
