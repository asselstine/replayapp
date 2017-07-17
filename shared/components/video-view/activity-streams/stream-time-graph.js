import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Svg, {
  Polyline
} from 'react-native-svg'
import { streamPoints } from '../../../svg'

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

    var points = ''
    var sPoints = streamPoints(height, width, this.props.timeStream, this.props.dataStream, this.props.zoom)
    _.each(sPoints, (point) => {
      points += `${point[0]},${point[1]} `
    })

    return (
      <Svg
        height='100'
        width='100%'
        onLayout={this._onLayout}>
        <Polyline
          y={0}
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

StreamTimeGraph.defaultProps = {
  zoom: 1
}
