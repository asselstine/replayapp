import React, {
  Component
} from 'react'
import {
  View
} from 'react-native'
import { RawVideoList } from './raw-video-list'

export class AddVideoScreen extends Component {
  onPressVideo (rawVideoData) {
    this.props.navigation.navigate('VideoPreview', { rawVideoData })
  }

  render () {
    return (
      <RawVideoList onPressVideo={this.onPressVideo.bind(this)} />
    )
  }
}

AddVideoScreen.navigationOptions = (props) => {
  return {
    title: 'Add Video'
  }
}
