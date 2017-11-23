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
import { AddButton } from './add-button'
import _ from 'lodash'

export class LinkedVideosScreen extends Component {
  constructor (props) {
    super(props)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.onLongPressVideo = this.onLongPressVideo.bind(this)
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

  render () {
    return (
      <View>
        <LinkedVideosContainer
          onPressVideo={this.onPressVideo}
          onLongPressVideo={this.onLongPressVideo} />
        <WelcomeDialog />
      </View>
    )
  }
}

LinkedVideosScreen.navigationOptions = (props) => {
  return {
    title: 'Videos',
    headerLeft: <MenuButton onPress={() => { props.navigation.navigate('DrawerOpen') }} />,
    headerRight: <AddButton onSelectRawVideo={(rawVideoData) => {
      dispatchTrack(newVideo(rawVideoData), rawVideoDataProperties(rawVideoData))
      props.navigation.navigate('Video', { localIdentifier: rawVideoData.localIdentifier })
    }} />
  }
}
