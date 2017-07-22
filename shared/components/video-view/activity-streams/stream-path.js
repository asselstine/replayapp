import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Path
} from 'react-native-svg'
import { streamPoints, transformPoints } from '../../../svg'

export class StreamPath extends PureComponent {
  render () {
    var points = ''
    var sPoints = streamPoints(this.props.height, this.props.width, this.props.timeStream, this.props.dataStream)
    sPoints.unshift([0, this.props.height])
    sPoints.push([this.props.width, this.props.height])
    sPoints = transformPoints(sPoints, this.props.transform)
    _.each(sPoints, (point, index) => {
      if (index === 0) {
        points += `M${point[0]} ${point[1]} `
      } else {
        points += `L${point[0]} ${point[1]} `
      }
    })
    points += 'Z'
    return (
      <Path
        x={this.props.x}
        y={this.props.y}
        d={points}
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
