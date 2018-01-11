import reportError from './report-error'
import React from 'react'
import {
  Alert
} from 'react-native'
import _ from 'lodash'

const alert = _.throttle(() => {
  Alert.alert(
    'Error Communicating',
    'There was an error communicating with Strava; we have been notified.  Please try again later.',
    [
      { text: 'OK' }
    ]
  )
}, 1000, { trailing: false })

export default function (response) {
  var ok = response && response.ok
  if (!ok) {
    reportError(`Strava responded with ${_.get(response, 'status')}: ${_.get(response, 'url')}`)
    alert()
  }
  return !ok
}
