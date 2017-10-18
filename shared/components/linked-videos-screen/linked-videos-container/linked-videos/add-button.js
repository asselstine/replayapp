import React, {
  Component
} from 'react'
import {
  TouchableOpacity
} from 'react-native'
import { store } from '../../../../store'
import { newVideo } from '../../../../actions/video-actions'
import Icon from 'react-native-vector-icons/Ionicons'
import { RawVideoModal } from '../../raw-video-modal'
import PropTypes from 'prop-types'

export class AddButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
    this.onPress = this.onPress.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
  }

  onPress () {
    this.setState({
      visible: true
    })
  }

  onClose () {
    this.setState({
      visible: false
    })
  }

  onPressVideo (rawVideoData) {
    this.setState({
      visible: false
    }, () => { this.props.onSelectRawVideo(rawVideoData) })
  }

  render () {
    return (
      <TouchableOpacity onPress={this.onPress} style={styles.buttonContainer}>
        <Icon name='ios-add' style={styles.addIcon} />
        <RawVideoModal
          isOpen={this.state.visible}
          onClose={this.onClose}
          onPressVideo={this.onPressVideo} />
      </TouchableOpacity>
    )
  }
}

AddButton.propTypes = {
  onSelectRawVideo: PropTypes.func.isRequired
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
    fontSize: 72,
    fontWeight: '500'
  }
}
