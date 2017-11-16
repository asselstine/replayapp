import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import PropTypes from 'prop-types'
import React from 'react'
import {
  TouchableOpacity
} from 'react-native'

const MenuButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <MaterialIcon name='menu' style={styles.icon} />
  </TouchableOpacity>
)

MenuButton.propTypes = {
  onPress: PropTypes.func.isRequired
}

const styles = {
  icon: {
    fontWeight: '500',
    fontSize: 24,
    padding: 10
  }
}

export default MenuButton
