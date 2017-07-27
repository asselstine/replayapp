import React, {
  Component
} from 'react'
import {
  Text,
  G
} from 'react-native-svg'
import PropTypes from 'prop-types'

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
    return (
      <G>
        <Text
          fill='black'
          stroke='black'
          fontSize='14'
          fontWeight='bold'
          x={10}
          y={this.props.velocityY}>
          {this.state.velocityText}
        </Text>
        <Text
          fill='black'
          stroke='black'
          fontSize='14'
          fontWeight='bold'
          x={10}
          y={this.props.altitudeY}>
          {this.state.altitudeText}}
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
