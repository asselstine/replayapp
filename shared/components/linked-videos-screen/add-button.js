import React, {
  Component
} from 'react'
import {
  TouchableOpacity
} from 'react-native'
import { store } from '../../store'
import { newVideo } from '../../actions/video-actions'
import Icon from 'react-native-vector-icons/Ionicons'
import { RawVideoModal } from './raw-video-modal'

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
    }, () => {
      store.dispatch(newVideo(rawVideoData))
      this.props.navigation.navigate('Video', { localIdentifier: rawVideoData.localIdentifier })
    })
  }

  render () {
    return (
      <TouchableOpacity onPress={this.onPress}>
        <Icon name='ios-add' style={styles.addIcon} />
        <RawVideoModal
          isOpen={this.state.visible}
          onClose={this.onClose}
          onPressVideo={this.onPressVideo} />
      </TouchableOpacity>
    )
  }
}

const styles = {
  addIcon: {
    fontSize: 32,
    padding: 16
  }
}
