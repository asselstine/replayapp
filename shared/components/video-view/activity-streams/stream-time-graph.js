import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Svg, {
  Polyline
} from 'react-native-svg'
import { timeToIndex, linearIndex } from '../../../streams'

export class StreamTimeGraph extends PureComponent {
  constructor (props) {
    super(props)
    this._onLayout = this._onLayout.bind(this)
    this.state = {
      height: 1,
      width: 1
    }
  }

  _onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width') || 1,
      height: _.get(event, 'nativeEvent.layout.height') || 1
    })
  }

  render () {
    var height = this.state.height || 1
    var width = this.state.width || 1

    var timeMin = this.props.timeStream[0]
    var timeMax = this.props.timeStream[this.props.timeStream.length - 1]
    var maxValue = Math.max(...this.props.dataStream)
    var index = -1
    var points = ''
    var time, value, xFraction

    var numPoints = 100.0

    for (var i = 0; i <= numPoints; i++) {
      xFraction = (i / numPoints)
      time = timeMin + xFraction * (timeMax - timeMin)
      index = timeToIndex(time, this.props.timeStream, index)
      value = linearIndex(index, this.props.dataStream)
      points += `${xFraction * width},${-(value / maxValue) * (height - 1)} `
    }

    return (
      <Svg
        height='100'
        width='100%'
        onLayout={this._onLayout}>
        <Polyline
          y={height - 1}
          points={points}
          fill='none'
          stroke='black'
          strokeWidth='1' />
      </Svg>
    )
  }
}

StreamTimeGraph.propTypes = {
  dataStream: PropTypes.array.isRequired,
  timeStream: PropTypes.array.isRequired
}
