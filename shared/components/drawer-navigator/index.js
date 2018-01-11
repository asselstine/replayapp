import { DrawerNavigator as Navigator } from 'react-navigation'
import { VideosNavigator } from '../videos-navigator'
import { Content } from './content'
import { FeedbackNavigator } from '../feedback-navigator'
import { SettingsNavigator } from '../settings-navigator'

const screens = {
  Videos: {
    screen: VideosNavigator,
  },
  Feedback: {
    screen: FeedbackNavigator
  },
  Settings: {
    screen: SettingsNavigator
  },
}

export const DrawerNavigator = Navigator(screens, {
  contentComponent: Content,
})
