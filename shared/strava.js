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

  retrieveActivity (activityId) {
    return (
      fetch(`${this.baseUrl}/activities/${activityId}`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  retrieveStreams (activityId) {
    return (
      fetch(`${this.baseUrl}/activities/${activityId}/streams/latlng,time,velocity_smooth,altitude`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  retrieveSegmentSegmentEfforts (segmentId) {
    return (
      fetch(`${this.baseUrl}/segments/${segmentId}/all_efforts?page=1&per_page=1`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  retrieveLeaderboard (segmentId) {
    return (
      fetch(`${this.baseUrl}/segments/${segmentId}/leaderboard?&page=1&per_page=1`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  // retrieveLeaderboard (segmentId) {
  //   return (
  //     fetch(`${this.baseUrl}/segments/${segmentId}/leaderboard?following=true&page=1&per_page=1`, {
  //       headers: this.headers()
  //     }).catch((error) => {
  //       console.error(error)
  //     })
  //   )
  // },

  retrieveSegmentEffortStream (segmentEffortId) {
    return (
      fetch(`${this.baseUrl}/segment_efforts/${segmentEffortId}/streams/distance,time,moving`, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  },

  compareEfforts (segmentId, referenceSegmentEffortId, segmentEffortId) {
    var url = `https://www.strava.com/segments/${segmentId}/compare_efforts?reference_id=${referenceSegmentEffortId}&comparing_id=${segmentEffortId}`
    console.log(`Strava ${url}`)
    return (
      fetch(url, {
        headers: this.headers()
      }).catch((error) => {
        console.error(error)
      })
    )
  }
}
