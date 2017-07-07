import { store } from './store'
import _ from 'lodash'

/* global fetch */

export const Strava = {
  baseUrl: 'https://www.strava.com/api/v3',

  headers () {
    return {
      'Authorization': _.get(store.getState(), 'strava.credentials.authorizationHeader')
    }
  },

  listActivities (params) {
    params = params || {}
    params = _.merge({
      page: 1,
      per_page: 20
    }, params)
    return (
      fetch(`${this.baseUrl}/athlete/activities?page=${params.page}&per_page=${params.per_page}`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  retrieveStream (activityId) {
    return (
      fetch(`${this.baseUrl}/activities/${activityId}/streams/latlng,time`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  }
}
