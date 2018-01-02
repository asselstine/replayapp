import React, { Component } from 'react'
import { StravaActivityList } from './strava-activity-list'
import {
  Modal,
  TouchableHighlight,
  Text,
  View
} from 'react-native'
import PropTypes from 'prop-types'
import ModalStyle from '../../../../styles/modal'
import { Button } from '../../../button'

export class StravaActivitySelectModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={this.props.onClose}>
        <View style={ModalStyle.header}>
          <Text style={ModalStyle.title}>Select Activity</Text>
        </View>
        <View style={ModalStyle.body}>
          <StravaActivityList onPress={this.props.onSelect} />
        </View>
        <View style={ModalStyle.footer}>
          <Button
            style={{width: '100%'}}
            title='Cancel'
            onPress={this.props.onClose} />
        </View>
      </Modal>
    )
  }
}

StravaActivitySelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}
