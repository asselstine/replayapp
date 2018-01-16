import reportError from './report-error'
import React from 'react'
import {
  Alert
} from 'react-native'
import _ from 'lodash'

export default {
  connection: _.throttle((callback) => {
    Alert.alert(
      'Error Communicating',
      'There was an error communicating with Strava; we have been notified.  Please try again later.',
      [
        { text: 'OK', onPress: (callback || (() => {})) }
      ]
    )
  }, 1000, { trailing: false }),

  activity: _.throttle((callback) => {
    Alert.alert(
      'Missing Activity',
      'The activity is no longer on Strava.',
      [
        { text: 'OK', onPress: (callback || (() => {})) }
      ]
    )
  }, 1000, { trailing: false }),

  permissions: _.throttle((callback) => {
    Alert.alert(
      'Not Permitted',
      'You do not have permission to access this activity.  Please authenticate again.',
      [
        { text: 'Authenticate', onPress: (callback || (() => {})) }
      ]
    )
  }, 1000, { trailing: false }),
}
