import React from 'react'
import {
  Alert
} from 'react-native'

export default function () {
  Alert.alert(
    'Could not connect',
    "We can't seem to connect to Strava.  Please try again later!",
    [
      { text: 'OK' }
    ]
  )
}
