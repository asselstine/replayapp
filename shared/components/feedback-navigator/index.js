import { StackNavigator } from 'react-navigation'
import { FeedbackScreen } from './feedback-screen'

export const FeedbackNavigator = StackNavigator(
  {
    FeedbackScreen: { screen: FeedbackScreen },
  }
)
