import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Polyline
} from 'react-native-svg'
import { streamPoints, transformPoints } from '../../../../svg'

export class StreamPolyline extends PureComponent {
  render () {
    var points = ''
    var sPoints = streamPoints(this.props.height, this.props.width, this.props.timeStream, this.props.dataStream)
    sPoints = transformPoints(sPoints, this.props.transform)
    _.each(sPoints, (point) => {
      points += `${point[0]},${point[1]} `
    })
    return (
      <Polyline
        x={this.props.x}
        y={this.props.y}
        points={points}
        fill='none'
        stroke='black'
        strokeWidth='1' />
    )
  }
}

StreamPolyline.propTypes = {
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  dataStream: PropTypes.array.isRequired,
  timeStream: PropTypes.array.isRequired,
  transform: PropTypes.array
}

StreamPolyline.defaultProps = {
  x: 0,
  y: 0
}
