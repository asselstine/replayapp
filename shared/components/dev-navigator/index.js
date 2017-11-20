import { StackNavigator } from 'react-navigation'
import { DevScreen } from './dev-screen'

export const DevNavigator = StackNavigator(
  {
    Development: { screen: DevScreen },
  },
)
