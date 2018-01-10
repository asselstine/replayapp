import React, {
  Component
} from 'react'
import {
  Text,
  G
} from 'react-native-svg'
import PropTypes from 'prop-types'
import dpiNormalize from '../../../../dpi-normalize'

export class TextLayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      velocityText: props.velocityText,
      altitudeText: props.altitudeText
    }
  }

  updateText (velocityText, altitudeText) {
    this.setState({ velocityText, altitudeText })
  }

  render () {
    var labelTopPadding = 10
    var labelLeftPadding = 10

    return (
      <G>
        <Text
          fill={styles.label.fill}
          stroke={styles.label.stroke}
          fontSize={styles.label.fontSize}
          fontWeight={styles.label.fontWeight}
          x={labelLeftPadding}
          y={this.props.velocityY + labelTopPadding}>
          {this.state.velocityText}
        </Text>
        <Text
          fill={styles.label.fill}
          stroke={styles.label.stroke}
          fontSize={styles.label.fontSize}
          fontWeight={styles.label.fontWeight}
          x={labelLeftPadding}
          y={this.props.altitudeY + labelTopPadding}>
          {this.state.altitudeText}
        </Text>
      </G>
    )
  }
}

TextLayer.propTypes = {
  velocityText: PropTypes.string,
  altitudeText: PropTypes.string,
  velocityY: PropTypes.any,
  altitudeY: PropTypes.any
}

const styles = {
  label: {
    fill: 'black',
    stroke: 'black',
    fontSize: dpiNormalize(14) + '',
    fontWeight: '100'
  }
}
