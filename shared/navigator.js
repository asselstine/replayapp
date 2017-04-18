import { StackNavigator } from 'react-navigation'

import { VideoBrowserScreen } from './video-browser-screen'

export const Navigator = StackNavigator({
  VideoBrowser: { screen: VideoBrowserScreen }
})
