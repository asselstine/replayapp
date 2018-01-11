import { StackNavigator } from 'react-navigation'
import { SettingsScreen } from './settings-screen'

export const SettingsNavigator = StackNavigator(
  {
    Settings: { screen: SettingsScreen },
  },
)
