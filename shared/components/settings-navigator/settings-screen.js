import React, {
  Component
} from 'react'
import {
  View,
  Text,
  Alert,
} from 'react-native'
import { Button as MyButton } from '../button'
import { store } from '../../store'
import GlobalActions from '../../actions/global-actions'
import CacheActions from '../../actions/cache-actions'
import MenuButton from '../menu-button'
import screenStyles from '../../styles/screen'

export class SettingsScreen extends Component {
  onResetApp () {
    Alert.alert(
      'Are you sure?',
      'This will reset the app entirely',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => { this.reset() } }
      ]
    )
  }

  onResetCache () {
    store.dispatch(CacheActions.reset())
  }

  reset () {
    store.dispatch(GlobalActions.reset())
  }

  render () {
    return (
      <View style={screenStyles.view}>
        <Text style={screenStyles.title}>Reset Cache</Text>
        <Text style={screenStyles.p}>Replay caches Strava data for up to seven days to keep things speedy.  If you've manually changed an activity you'll want to reset the cache so that Replay can fetch the new data.</Text>
        <MyButton
          onPress={this.onResetCache.bind(this)}
          title='Reset Cache'
          backgroundColor='green'
          color='white' />
        <Text style={screenStyles.title}>Reset App</Text>
        <Text style={screenStyles.p}>This will remove all data and reset the app.</Text>
        <MyButton
          onPress={this.onResetApp.bind(this)}
          title='Reset App'
          backgroundColor='red'
          color='white' />
      </View>
    )
  }
}

SettingsScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Settings',
    headerLeft: <MenuButton onPress={() => { navigation.navigate('DrawerOpen') }} />
  }
}
