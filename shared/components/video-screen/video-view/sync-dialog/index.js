import React, { Component } from 'react'
import {
  Modal,
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import HelpStyles from '../../../../styles/help'
import { Button } from '../../../button'

export class SyncDialog extends Component {
  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}>
        <View style={[HelpStyles.flexCol, HelpStyles.content]}>
          <View>
            <View style={HelpStyles.block}>
              <MaterialIcon
                name='warning'
                style={styles.warningIcon} />
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explain}>The activity could not be synchronized automatically.</Text>
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explain}>You will need to:</Text>
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explainBold}>1. Unlock the activity</Text>
            </View>
            <View style={HelpStyles.block}>
              <MaterialCommunityIcon
                name='lock'
                style={styles.lockIcon} />
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explainBold}>2. Align the video and activity by changing the activity time</Text>
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explainBold}>3. Relock the activity</Text>
            </View>
            <View style={HelpStyles.block}>
              <MaterialCommunityIcon
                name='lock-open'
                style={styles.lockIcon} />
            </View>
          </View>
          <Button title='Got it!' onPress={this.props.onClose} />
        </View>
      </Modal>
    )
  }
}

SyncDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

const styles = {
  warningIcon: {
    fontSize: 48,
    color: 'red'
  },

  lockIcon: {
    fontSize: 48,
    color: 'black',
    alignSelf: 'center'
  },
}
