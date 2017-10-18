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
    return (
      <Path
        x={this.props.x}
        y={this.props.y}
        d={this.props.d}
        fill={this.props.fill}
        clipPath={this.props.clipPath} />
    )
  }
}

StreamPath.propTypes = {
  x: PropTypes.any,
  y: PropTypes.any,
  fill: PropTypes.any,
  clipPath: PropTypes.any,
  d: PropTypes.any
}

StreamPath.defaultProps = {
  x: 0,
  y: 0,
  fill: 'red',
  d: ''
}
