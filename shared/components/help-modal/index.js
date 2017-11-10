import React, { Component } from 'react'
import {
  Modal,
  View,
  Text,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'

export const HelpModal = connect(
  (state, ownProps) => {
    var seen = _.get(state, `help.seen[${ownProps.helpKey}]`, false)
    return {
      isOpen: !seen
    }
  }
)(class extends Component {
  render () {
    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}>
        {this.props.children}
      </Modal>
    )
  }
})

HelpModal.propTypes = {
  helpKey: PropTypes.string.isRequired
}

HelpModal.defaultProps = {
  isOpen: false
}
