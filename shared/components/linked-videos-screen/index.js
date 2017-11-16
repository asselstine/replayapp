import React, {
  Component
} from 'react'
import MenuButton from '../menu-button'
import {
  View,
  StatusBar,
  Button,
  Image,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native'
import { LinkedVideosContainer } from './linked-videos-container'
import dispatchTrack from '../../store/dispatch-track'
import videoProperties from '../../analytics/video-properties'
import rawVideoDataProperties from '../../analytics/raw-video-data-properties'
import { newVideo, removeVideo } from '../../actions/video-actions'
import { WelcomeDialog } from './welcome-dialog'

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
    dispatchTrack(removeVideo(video), videoProperties(video))
  }

  onAddRawVideo (rawVideoData) {
   dispatchTrack(newVideo(rawVideoData), rawVideoDataProperties(rawVideoData))
   this.props.navigation.navigate('Video', { localIdentifier: rawVideoData.localIdentifier })
  }

  render () {
    return (
      <View>
        <LinkedVideosContainer
          onAddRawVideo={this.onAddRawVideo}
          onPressVideo={this.onPressVideo}
          onLongPressVideo={this.onLongPressVideo} />
        <WelcomeDialog />
      </View>
    )
  }
}

LinkedVideosScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Videos',
    headerLeft: <MenuButton onPress={() => { navigation.navigate('DrawerOpen') }} />
  }
}
