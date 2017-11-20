import React, {
  Component
} from 'react'
import {
  View,
  Button
} from 'react-native'
import { store } from '../../store'
import { resetHelp } from '../../actions/help-actions'
import MenuButton from '../menu-button'

export class DevScreen extends Component {
  onReset () {
    store.dispatch(resetHelp())
  }

  render () {
    return (
      <View>
        <Button title='Reset Help' onPress={this.onReset.bind(this)} />
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
