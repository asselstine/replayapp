import { DrawerNavigator as Navigator } from 'react-navigation'
import { VideosNavigator } from '../videos-navigator'
import { Content } from './content'
import { FeedbackNavigator } from '../feedback-navigator'

export const DrawerNavigator = Navigator({
  Videos: {
    screen: VideosNavigator,
  },
  Feedback: {
    screen: FeedbackNavigator
  }
}, {
  contentComponent: Content,
})
