import React, {
  Component,
  Text
} from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'
import { StravaActivitySelect } from './strava-activity-select'

export class StravaActivitySelectScreen extends Component {
  render () {
    return (
      <Provider store={store}>
        <Text>{'Hello'}</Text>
      </Provider>
    )
  }
}
