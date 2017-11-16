import React, { Component } from 'react'
import _ from 'lodash'
import MenuButton from '../../menu-button'
import {
  View,
  Button,
  Alert,
  Text
} from 'react-native'
import Mailer from 'react-native-mail'
import Config from 'react-native-config'

export class FeedbackScreen extends Component {
  sendFeedback () {
    Mailer.mail({
      subject: 'Feedback',
      recipients: [Config.FEEDBACK_EMAIL],
      body: '',
      isHTML: false,
    }, (error, event) => {
      if (event == 'sent') {
        Alert.alert(
          'Feedback Sent',
          "Thanks!  We'll be in touch!",
          [
            { text: 'Ok' },
          ]
        )
      }
    });
  }

  render () {
    return (
      <View>
        <Button onPress={this.sendFeedback.bind(this)} title='Send Feedback' />
      </View>
    )
  }
}

FeedbackScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Feedback',
    headerLeft: <MenuButton onPress={() => { navigation.navigate('DrawerOpen') }} />
  }
}
