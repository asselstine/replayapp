import { StackNavigator } from 'react-navigation'

import { VideoBrowserScreen } from './video-browser-screen'
import { VideoScreen } from './video-screen'

export const Navigator = StackNavigator(
  {
    VideoBrowser: { screen: VideoBrowserScreen },
    Video: { screen: VideoScreen }
  },
  {
    initialRouteName: 'VideoBrowser'
  }
)
