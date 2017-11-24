import { store } from './store'
import _ from 'lodash'
import reportError from './report-error'
import { manager } from './oauth'

/* global fetch */

export const Strava = {
  baseUrl: 'https://www.strava.com/api/v3',

  authorize () {
    return manager.authorize('strava', { scopes: 'view_private' })
  },

  deauthorize () {
    return manager.deauthorize('strava')
  },

  headers () {
    return {
      'Authorization': _.get(store.getState(), 'strava.credentials.authorizationHeader')
    }
  },

  retrieveCurrentAthlete () {
    return (
      fetch(`${this.baseUrl}/athlete`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
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
        reportError(error)
      })
    )
  },

  retrieveActivity (activityId) {
    return (
      fetch(`${this.baseUrl}/activities/${activityId}`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveStreams (activityId) {
    return (
      fetch(`${this.baseUrl}/activities/${activityId}/streams/latlng,time,velocity_smooth,altitude`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveSegmentSegmentEfforts (segmentId) {
    return (
      fetch(`${this.baseUrl}/segments/${segmentId}/all_efforts?page=1&per_page=1`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveLeaderboard (segmentId) {
    return (
      fetch(`${this.baseUrl}/segments/${segmentId}/leaderboard?&page=1&per_page=1`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveSegmentEffortStream (segmentEffortId) {
    return (
      fetch(`${this.baseUrl}/segment_efforts/${segmentEffortId}/streams/distance,time,moving`, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  compareEfforts (segmentId, referenceSegmentEffortId, segmentEffortId) {
    var url = `https://www.strava.com/segments/${segmentId}/compare_efforts?reference_id=${referenceSegmentEffortId}&comparing_id=${segmentEffortId}`
    return (
      fetch(url, {
        headers: this.headers()
      }).catch((error) => {
        reportError(error)
      })
    )
  },
}
