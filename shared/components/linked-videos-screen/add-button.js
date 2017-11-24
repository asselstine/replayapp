import React, {
  Component
} from 'react'
import {
  TouchableOpacity
} from 'react-native'
import { resetHelp } from '../../actions/help-actions'
import { store } from '../../store'
import { newVideo } from '../../actions/video-actions'
import Icon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types'

export class AddButton extends Component {
  render () {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.buttonContainer}>
        <Icon name='ios-add' style={styles.addIcon} />
      </TouchableOpacity>
    )
  }
}

AddButton.propTypes = {
  onPress: PropTypes.func.isRequired,
}

const styles = {
  buttonContainer: {
    width: '50%',
    aspectRatio: 1.0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },

  addIcon: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '500'
  }
}
