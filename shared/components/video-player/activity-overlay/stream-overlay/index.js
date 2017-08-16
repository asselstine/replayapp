import React, {
  Component
} from 'react'
import {
  createBoundsTransform
} from '../../../../streams'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Svg, {
  ClipPath,
  Path,
  Rect,
  G
} from 'react-native-svg'
import {
  PanResponder
} from 'react-native'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import {
  mergeStreams,
  transformPoints,
  pointsToPath,
  viewportTransform
} from '../../../../svg'

export class StreamOverlay extends Component {
  constructor (props) {
    super(props)
    this._onLayout = this._onLayout.bind(this)
    this.state = {
      width: 1,
      height: 1,
      transform: this.createTransform(this.props, 1, 1)
    }
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderGrant: (evt, gestureState) => {
        this._moveCursor(evt)
      },
      onPanResponderMove: (evt, gestureState) => {
        this._moveCursor(evt)
      }
    })
  }

  componentWillReceiveProps (props) {
    this.setState({
      transform: this.createTransform(props)
    })
  }

  _moveCursor (event) {
    var inverse = MatrixMath.inverse(this.createTransform())
    var timeV = this.transform(event.nativeEvent.locationX, 0, inverse)
    this.props.onActivityTimeChange(timeV[0])
  }

  createTransform (props = this.props, width = this.state.width, height = this.state.height) {
    var transform = createBoundsTransform(props.timeStream, props.dataStream, 0, height, width, -height)
    var activityStartTime = props.activityStartTime || props.timeStream[0]
    var activityEndTime = props.activityEndTime || props.timeStream[ props.timeStream.length - 1 ]
    var viewStart = this.transform(activityStartTime, 0, transform)
    var viewEnd = this.transform(activityEndTime, 0, transform)
    var viewWidth = viewEnd[0] - viewStart[0]
    var viewport = viewportTransform(viewStart[0], viewWidth, 0, width)
    MatrixMath.multiplyInto(transform, viewport, transform)
    return transform
  }

  _onLayout (e) {
    var width = _.get(e, 'nativeEvent.layout.width')
    var height = _.get(e, 'nativeEvent.layout.height')
    this.setState({
      width: width,
      height: height,
      transform: this.createTransform(this.props, width, height)
    })
  }

  transform (x, y, transform = this.state.transform) {
    return MatrixMath.multiplyVectorByMatrix([x, y, 0, 1], transform)
  }

  updateCurrentTimeActivity (currentTimeActivity) {
    this._timeClippingRect.setNativeProps({
      width: this.transform(currentTimeActivity, 0)[0].toString()
    })
  }

  render () {
    var points = mergeStreams(this.props.timeStream, this.props.dataStream)
    points = transformPoints(points, this.state.transform)
    points.unshift([0, this.state.height])
    points.push([this.state.width, this.state.height])
    var path = pointsToPath(points)

    var streamPath =
      <Path
        x={0}
        y={0}
        d={path}
        fill='grey' />
    var streamCurrentTimePath =
      <Path
        x={0}
        y={0}
        d={path}
        fill='white' />

    var clipWidth = this.transform(this.props.currentTimeActivity || 0, 0)[0].toString()

    return (
      <Svg
        height={this.props.height}
        width='100%'
        onLayout={this._onLayout}
        {...this._panResponder.panHandlers}>
        <ClipPath id='timeClip'>
          <Rect
            ref={(ref) => { this._timeClippingRect = ref }}
            x={0}
            y={0}
            width={clipWidth}
            height={this.state.height} />
        </ClipPath>
        <G>
          {streamPath}
        </G>
        <G clipPath='url(#timeClip)'>
          {streamCurrentTimePath}
        </G>
      </Svg>
    )
  }
}

StreamOverlay.propTypes = {
  currentTimeActivity: PropTypes.any,
  timeStream: PropTypes.array.isRequired,
  dataStream: PropTypes.array.isRequired,
  height: PropTypes.number,
  activityStartTime: PropTypes.any,
  activityEndTime: PropTypes.any,
  onActivityTimeChange: PropTypes.func
}

StreamOverlay.defaultProps = {
  height: 100
}
