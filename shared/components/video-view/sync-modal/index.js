import React, { Component } from 'react'
import { Modal, TouchableHighlight, Text, View } from 'react-native'
import PropTypes from 'prop-types'

export class SyncModal extends Component {
  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        onRequestClose={this.props.onClose}>
        <View style={{marginTop: 22}}>
          <TouchableHighlight onPress={this.props.onClose}>
            <Text>Cancel</Text>
          </TouchableHighlight>
        </View>
      </Modal>
    )
  }
}

SyncModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSet: PropTypes.func.isRequired,
  rawVideoData: PropTypes.object,
  activity: PropTypes.object
}
