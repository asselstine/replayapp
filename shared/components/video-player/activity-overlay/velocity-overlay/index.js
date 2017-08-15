import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View
} from 'react-native'

export class VelocityOverlay extends Component {
  render () {
    return (
      <View />
    )
  }
}

VelocityOverlay.propTypes = {
  streams: PropTypes.object.isRequired
}
