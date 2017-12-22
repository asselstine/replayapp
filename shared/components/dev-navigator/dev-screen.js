import React, {
  Component
} from 'react'
import {
  View,
  Button
} from 'react-native'
import GlobalActions from '../../actions/global-actions'
import MenuButton from '../menu-button'

export class DevScreen extends Component {
  onReset () {
    store.dispatch(GlobalActions.reset())
  }

  render () {
    return (
      <View>
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
