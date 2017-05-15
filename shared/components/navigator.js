import { StackNavigator } from 'react-navigation'

import { VideoBrowserScreen } from './video-browser-screen'
import { VideoScreen } from './video-screen'
import { StravaActivitySelectScreen } from './strava-activity-select-screen'

export const Navigator = StackNavigator({
  VideoBrowser: { screen: VideoBrowserScreen },
  Video: { screen: VideoScreen },
  StravaActivitySelect: { screen: StravaActivitySelectScreen }
})
