import React, {
  Component
} from 'react'
import {
  View,
  Text
} from 'react-native'
import PropTypes from 'prop-types'

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      segments: [],
      streams: {}
    }
  }

  updateCurrentTime (currentTimeActivity) {
    console.log(currentTimeActivity)
  }

  render () {
    return (
      <View>
        <Text>ablaksdd</Text>
      </View>
    )
  }
}

ActivityOverlay.propTypes = {
  currentTimeActivity: PropTypes.any.isRequired,
  activity: PropTypes.object.isRequired
}
