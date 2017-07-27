import React from 'react'
import {
  TouchableOpacity,
  Alert
} from 'react-native'
import { LinkedVideosContainer } from './linked-videos-container'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { removeVideo } from '../../actions/video-actions'
import Icon from 'react-native-vector-icons/Ionicons'

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
      <Provider store={store}>
        <LinkedVideosContainer onPressVideo={this.onPressVideo} onLongPressVideo={this.onLongPressVideo} />
      </Provider>
    )
  }
})

LinkedVideosScreen.navigationOptions = (props) => {
  return {
    title: 'Videos',
    headerRight: (
      <TouchableOpacity onPress={() => {
        props.navigation.navigate('VideoBrowser')
      }}>
        <Icon name='ios-add' style={styles.addIcon} />
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
