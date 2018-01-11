import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveActivity,
  receiveStreams
} from '../actions/activity-actions'
import reportError from '../report-error'
import cacheExpired from '../cache-expired'
import CacheActions from '../actions/cache-actions'
import alertResponseError from '../alert-response-error'

function resolvedPromise() {
  return new Promise((resolve, reject) => { resolve() })
}

export const ActivityService = {
  retrieveActivity (activityId) {
    var cacheKey = `activities[${activityId}].detailCachedAt`
    if (!cacheExpired(cacheKey)) {
      return resolvedPromise()
    }
    return (
      Strava.retrieveActivity(activityId).then((response) => {
        if (!response.ok) {
          alertResponseError(response)
          return
        }
        response.json().then((json) => {
          store.dispatch(receiveActivity(activityId, json))
          store.dispatch(CacheActions.set(cacheKey))
        }).catch((error) => {
          reportError(error)
        })
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveStreams (activityId) {
    var cacheKey = `activities[${activityId}].streamsCachedAt`
    if (!cacheExpired(cacheKey)) {
      return resolvedPromise()
    }
    return (
      Strava
        .retrieveStreams(activityId)
        .then((response) => {
          if (!response.ok) {
            alertResponseError(response)
            return
          }
          response.json().then((data) => {
            store.dispatch(receiveStreams(activityId, data))
            store.dispatch(CacheActions.set(cacheKey))
          }).catch((error) => {
            reportError(error)
          })
        }).catch((error) => {
          reportError(error)
        })
    )
  }
}
