import React, {
  Component
} from 'react'
import {
  G,
  Line,
  Text
} from 'react-native-svg'
import PropTypes from 'prop-types'

export class InfoLine extends Component {
  render () {
    var textWidth = 30
    var textAnchor = 'middle'
    var labelX = -textWidth
    if (this.props.x < textWidth) {
      labelX = textWidth
    }

    return (
      <G x={this.props.x} width={textWidth}>
        <Text x={labelX} width={0} textAnchor={textAnchor}>
          {this.props.label}
        </Text>
        <Line
          x1={0}
          y1={0}
          x2={0}
          y2={this.props.height}
          stroke={'black'}
          strokeDasharray={[5, 5]}
          strokeWidth='1' />
      </G>
    )
  }
}

InfoLine.propTypes = {
  label: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  height: PropTypes.any.isRequired
}
