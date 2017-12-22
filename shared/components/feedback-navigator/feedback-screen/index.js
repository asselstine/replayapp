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
import { Button as MyButton } from '../../button'
import { store } from '../../../store'
import { resetHelp } from '../../../actions/help-actions'

export class FeedbackScreen extends Component {
  onResetHelp () {
    store.dispatch(resetHelp())
  }

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
      <View style={styles.view}>
        <Text style={styles.title}>Feedback</Text>
        <Text style={styles.p}>Tell us about your suggestions, bugs or favourite things about the app!</Text>
        <MyButton
          onPress={this.sendFeedback.bind(this)}
          title='Send Feedback'
          backgroundColor='#ffc600'
          color='black' />

        <Text style={styles.title}>Help</Text>
        <Text style={styles.p}>Reset the contextual help messages if you want to see them again.</Text>

        <MyButton
          onPress={this.onResetHelp.bind(this)}
          title='Reset Help Messages'
          backgroundColor='red'
          color='white' />
      </View>
    )
  }
}

FeedbackScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'App Feedback & Help',
    headerLeft: <MenuButton onPress={() => { navigation.navigate('DrawerOpen') }} />
  }
}

const styles = {
  view: {
    padding: 10
  },

  title: {
    marginTop: 20,
    fontSize: 24,
  },

  p: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 15
  }
}
