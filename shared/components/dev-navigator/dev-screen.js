import React, {
  Component
} from 'react'
import {
  View,
  Button
} from 'react-native'
import { store } from '../../store'
import { resetHelp } from '../../actions/help-actions'
import GlobalActions from '../../actions/global-actions'
import MenuButton from '../menu-button'

export class DevScreen extends Component {
  onResetHelp () {
    store.dispatch(resetHelp())
  }

  onReset () {
    store.dispatch(GlobalActions.reset())
  }

  render () {
    return (
      <View>
        <Button title='Reset Help' onPress={this.onResetHelp.bind(this)} />
        <Button title='Reset App' onPress={this.onReset.bind(this)} />
      </View>
    )
  }
}


DevScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Development',
    headerLeft: <MenuButton onPress={() => { navigation.navigate('DrawerOpen') }} />
  }
}
