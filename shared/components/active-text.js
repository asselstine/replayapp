import React, {
  Component
} from 'react'
import {
  Text
} from 'react-native'
import PropTypes from 'prop-types'

export class ActiveText extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: this.props.format(props.streamTime)
    }
  }

  componentWillReceiveProps (props) {
    this.onStreamTimeProgress(props.streamTime)
  }

  onStreamTimeProgress (streamTime) {
    var value = this.props.format(streamTime)
    this.setState({ value })
  }

  render () {
    return (
      <Text {...this.props}>
        {this.state.value}
      </Text>
    )
  }
}

ActiveText.propTypes = {
  streamTime: PropTypes.number.isRequired,
  format: PropTypes.func.isRequired
}
