import { StackNavigator } from 'react-navigation'

import { LinkedVideosScreen } from './linked-videos-screen'
import { VideoScreen } from './video-screen'

export const Navigator = StackNavigator(
  {
    LinkedVideos: { screen: LinkedVideosScreen },
    Video: { screen: VideoScreen }
  },
  {
    initialRouteName: 'LinkedVideos'
  }
)
