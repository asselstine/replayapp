import React, { Component } from 'react'
import {
  Modal,
  View,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
import { RawVideoList } from './raw-video-list'

export class RawVideoModal extends Component {
  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        onRequestClose={this.props.onClose}>
        <RawVideoList onPressVideo={this.props.onPressVideo} />
        <View style={{height: 40}}>
          <Button
            style={{width: '100%'}}
            title='Cancel'
            onPress={this.props.onClose}
            color='red' />
        </View>
      </Modal>
    )
  }
}

RawVideoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPressVideo: PropTypes.func.isRequired
}
