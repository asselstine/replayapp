import React, {
  Component
} from 'react'
import {
  View,
  StatusBar,
  Alert
} from 'react-native'
import { LinkedVideosContainer } from './linked-videos-container'
import { store } from '../../store'
import { newVideo, removeVideo } from '../../actions/video-actions'

export class LinkedVideosScreen extends Component {
  constructor (props) {
    super(props)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.onLongPressVideo = this.onLongPressVideo.bind(this)
    this.onAddRawVideo = this.onAddRawVideo.bind(this)
  }

  onPressVideo (video) {
    this.props.navigation.navigate('Video', { localIdentifier: video.rawVideoData.localIdentifier })
  }

  onLongPressVideo (video) {
    Alert.alert(
      'Remove this video?',
      '(this will not delete the video)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => { this.removeVideo(video) } }
      ]
    )
  }

  removeVideo (video) {
    store.dispatch(removeVideo(video))
  }

  onAddRawVideo (rawVideoData) {
   store.dispatch(newVideo(rawVideoData))
   this.props.navigation.navigate('Video', { localIdentifier: rawVideoData.localIdentifier })
  }

  render () {
    return (
      <View>
        <StatusBar hidden />
        <LinkedVideosContainer
          onAddRawVideo={this.onAddRawVideo}
          onPressVideo={this.onPressVideo}
          onLongPressVideo={this.onLongPressVideo} />
      </View>
    )
  }
}

LinkedVideosScreen.navigationOptions = (props) => {
  return {
    header: null,
  }
}
