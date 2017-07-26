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
import { zeroScreenY } from '../../../../svg'
import { linearIndex, minValueIndex, maxValueIndex } from '../../../../streams'

export class RaceGraph extends Component {
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
    var distanceStream = this.props.distanceStream
    var deltaTimeStream = this.props.deltaTimeStream
    var zeroY = zeroScreenY(this.state.height, deltaTimeStream)

    var maxDeltaTimeIndex = maxValueIndex(deltaTimeStream)
    var minDeltaTimeIndex = minValueIndex(deltaTimeStream)

    var minDistance = linearIndex(minDeltaTimeIndex, distanceStream)
    var maxDistance = linearIndex(maxDeltaTimeIndex, distanceStream)

    var xScale = 1.0 / distanceStream[distanceStream.length - 1]

    var minX = xScale * minDistance * this.state.width
    var maxX = xScale * maxDistance * this.state.width

    return (
      <Svg
        onLayout={this._onLayout}
        backgroundColor={'white'}
        width={this.props.width}
        height={this.props.height}>
        <ClipPath id='red'>
          <Rect y={zeroY - this.state.height} width={this.state.width} height={this.state.height} />
        </ClipPath>
        <ClipPath id='green'>
          <Rect y={zeroY} width={this.state.width} height={this.state.height} />
        </ClipPath>
        <RacePath
          distanceStream={distanceStream}
          deltaTimeStream={deltaTimeStream}
          width={this.state.width}
          height={this.state.height}
          stroke={'red'}
          fill='red'
          clipPath='url(#red)' />
        <RacePath
          distanceStream={distanceStream}
          deltaTimeStream={deltaTimeStream}
          width={this.state.width}
          height={this.state.height}
          fill='green'
          clipPath='url(#green)' />
        <Line
          x1={minX}
          y1={0}
          x2={minX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />
        <Line
          x1={maxX}
          y1={0}
          x2={maxX}
          y2={this.state.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />
      </Svg>
    )
  }
}

RaceGraph.propTypes = {
  distanceStream: PropTypes.array.isRequired,
  deltaTimeStream: PropTypes.array.isRequired,
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired
}
