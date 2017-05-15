import { fetch } from 'react-native'
import { store } from './store'
import _ from 'lodash'

export const Strava = {
  baseUrl: 'https://www.strava.com/api/v3',

  listActivities () {
    return (
      fetch(`${this.baseUrl}/athlete/activities`, {
        params: {
          access_token: _.get(store.getState(), 'strava.credentials.accessToken')
        }
      })
    )
  }
}
