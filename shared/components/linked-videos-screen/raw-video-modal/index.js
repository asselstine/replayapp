import React, { Component } from 'react'
import {
  Modal,
  View,
  Text,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
import { RawVideoList } from './raw-video-list'
import ModalStyle from '../../../styles/modal'

export class RawVideoModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showing: false
    }
    this._onShow = this._onShow.bind(this)
  }

  _onShow () {
    this.setState({
      showing: true
    })
  }

  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        onShow={this._onShow}
        onRequestClose={this.props.onClose}>
        <View style={ModalStyle.header}>
          <Text style={ModalStyle.title}>Select Video</Text>
        </View>
        <View style={ModalStyle.body}>
          <RawVideoList onPressVideo={this.props.onPressVideo} />
        </View>
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
