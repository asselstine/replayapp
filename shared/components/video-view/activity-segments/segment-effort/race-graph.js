import React, {
  Component
} from 'react'
import {
  Svg,
  ClipPath,
  Rect
} from 'react-native-svg'
import { RacePath } from './race-path'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { zeroScreenY } from '../../../../svg'

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
