import React from 'react'
import {
  Alert
} from 'react-native'
import { LinkedVideosContainer } from './linked-videos-container'
import { store } from '../../store'
import { removeVideo } from '../../actions/video-actions'
import { AddButton } from './add-button'

export const LinkedVideosScreen = React.createClass({
  onPressVideo (video) {
    this.props.navigation.navigate('Video', { localIdentifier: video.rawVideoData.localIdentifier })
  },

  onLongPressVideo (video) {
    Alert.alert(
      'Remove this video?',
      '(this will not delete the video)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => { this.removeVideo(video) } }
      ]
    )
  },

  removeVideo (video) {
    store.dispatch(removeVideo(video))
  },

  render () {
    return (
      <LinkedVideosContainer onPressVideo={this.onPressVideo} onLongPressVideo={this.onLongPressVideo} />
    )
  }
})

LinkedVideosScreen.navigationOptions = (props) => {
  return {
    title: 'Videos',
    headerRight: <AddButton {...props} />
  }
}
