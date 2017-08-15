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
    var points = mergeStreams(this.props.timeStream, this.props.dataStream)
    this.state = {
      width: 1,
      height: 1,
      transform: MatrixMath.createIdentityMatrix(),
      originalPoints: points,
      points: points,
      path: pointsToPath(points)
    }
  }

  _onLayout (e) {
    var width = _.get(e, 'nativeEvent.layout.width')
    var height = _.get(e, 'nativeEvent.layout.height')
    var transform = createBoundsTransform(this.props.timeStream, this.props.dataStream, 0, height, width, -height)
    var activityStartTime = this.props.activityStartTime || this.props.timeStream[0]
    var activityEndTime = this.props.activityEndTime || this.props.timeStream[ this.props.timeStream.length - 1 ]

    console.log('?????: ', activityStartTime, activityEndTime)
    var viewStart = this.transform(activityStartTime, 0, transform)
    var viewEnd = this.transform(activityEndTime, 0, transform)
    var viewWidth = viewEnd[0] - viewStart[0]
    var viewport = viewportTransform(viewStart[0], viewWidth, 0, this.state.width)
    MatrixMath.multiplyInto(transform, viewport, transform)
    var points = transformPoints(this.state.originalPoints, transform)
    this.setState({
      width: width,
      height: height,
      transform: transform,
      points: points,
      path: pointsToPath(points)
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
    var streamPath =
      <Path
        x={0}
        y={0}
        d={this.state.path}
        fill='grey' />
    var streamCurrentTimePath =
      <Path
        x={0}
        y={0}
        d={this.state.path}
        fill='white' />

    return (
      <Svg
        height={this.props.height}
        width='100%'
        onLayout={this._onLayout}>
        <ClipPath id='timeClip'>
          <Rect
            ref={(ref) => { this._timeClippingRect = ref }}
            x={0}
            y={0}
            width={'0'}
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
