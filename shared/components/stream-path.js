import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Path
} from 'react-native-svg'
import {
  streamPoints,
  transformPoints,
  pointsToPath
} from '../svg'

export class StreamPath extends PureComponent {
  render () {
    var sPoints = streamPoints(this.props.height, this.props.width, this.props.timeStream, this.props.dataStream)
    sPoints.unshift([0, this.props.height])
    sPoints.push([this.props.width, this.props.height])
    sPoints = transformPoints(sPoints, this.props.transform)
    var path = pointsToPath(sPoints)
    return (
      <Path
        x={this.props.x}
        y={this.props.y}
        d={path}
        fill={this.props.fill}
        clipPath={this.props.clipPath} />
    )
  }
}

StreamPath.propTypes = {
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  dataStream: PropTypes.array.isRequired,
  timeStream: PropTypes.array.isRequired,
  transform: PropTypes.array,
  fill: PropTypes.any,
  clipPath: PropTypes.any
}

StreamPath.defaultProps = {
  x: 0,
  y: 0,
  fill: 'red'
}
