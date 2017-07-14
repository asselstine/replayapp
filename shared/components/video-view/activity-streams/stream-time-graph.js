import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Svg, {
  Polyline
} from 'react-native-svg'
import { streamPoints } from '../../../svg'
import { timeToIndex } from '../../../streams'

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

    var startIndex = Math.floor(timeToIndex(this.props.startTime, this.props.timeStream))
    var endIndex = Math.ceil(timeToIndex(this.props.endTime, this.props.timeStream))

    var timeSubStream = _.slice(this.props.timeStream, startIndex, endIndex)
    var dataSubStream = _.slice(this.props.dataStream, startIndex, endIndex)

    var points = ''
    var sPoints = streamPoints(height, width, timeSubStream, dataSubStream)
    _.each(sPoints, (point) => {
      points += `${point[0]},${point[1]} `
    })

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
  timeStream: PropTypes.array.isRequired,
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired
}
