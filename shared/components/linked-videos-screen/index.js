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
import { WelcomeModal } from './welcome-modal'
import { AddButton } from './add-button'
import _ from 'lodash'

export class LinkedVideosScreen extends Component {
  constructor (props) {
    super(props)
    this.onPressVideo = _.debounce(this.onPressVideo.bind(this), 500, { leading: true, trailing: false })
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
        <WelcomeModal />
      </View>
    )
  }
}

LinkedVideosScreen.navigationOptions = (props) => {

  var navDrawer = _.debounce(() => {
    props.navigation.navigate('DrawerOpen')
  }, 500, { leading: true, trailing: false })

  var navAddVideo = _.debounce(() => {
    props.navigation.navigate('AddVideo')
  }, 500, { leading: true, trailing: false })

  return {
    title: 'Videos',
    headerLeft: <MenuButton onPress={navDrawer} />,
    headerRight: <AddButton onPress={navAddVideo} />,
  }
}
