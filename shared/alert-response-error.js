import reportError from './report-error'
import React from 'react'
import {
  Alert
} from 'react-native'

export default function (response) {
  if (response.ok) { return }
  reportError(`Strava responded with ${response.status}: ${response.url}`)
  Alert.alert(
    'Error Communicating',
    'There was an error communicating with Strava; we have been notified.  Please try again later.',
    [
      { text: 'OK' }
    ]
  )
}
