import { DrawerNavigator as Navigator } from 'react-navigation'
import { VideosNavigator } from '../videos-navigator'
import { Content } from './content'
import { FeedbackNavigator } from '../feedback-navigator'
import { DevNavigator } from '../dev-navigator'

const screens = {
  Videos: {
    screen: VideosNavigator,
  },
  Feedback: {
    screen: FeedbackNavigator
  }
}

if (__DEV__) {
  screens['Developer'] = {
    screen: DevNavigator
  }
}

export const DrawerNavigator = Navigator(screens, {
  contentComponent: Content,
})
