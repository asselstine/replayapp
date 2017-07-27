import React, { Component } from 'react'
import { StravaActivityList } from './strava-activity-list'
import { Modal, TouchableHighlight, Text, View } from 'react-native'
import PropTypes from 'prop-types'

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
        onRequestClose={this.props.onClose}>
        <StravaActivityList onPress={this.props.onSelect} />
        <View>
          <TouchableHighlight onPress={this.props.onClose}>
            <Text>Cancel</Text>
          </TouchableHighlight>
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
