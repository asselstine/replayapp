import { StackNavigator } from 'react-navigation'

import { LinkedVideosScreen } from './linked-videos-screen'
import { VideoBrowserScreen } from './video-browser-screen'
import { VideoScreen } from './video-screen'

export const Navigator = StackNavigator(
  {
    LinkedVideos: { screen: LinkedVideosScreen },
    VideoBrowser: { screen: VideoBrowserScreen },
    Video: { screen: VideoScreen }
  },
  {
    initialRouteName: 'LinkedVideos'
  }
)
