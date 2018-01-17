import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveActivity,
  receiveStreams,
  removeActivity
} from '../actions/activity-actions'
import {
  receiveCompareEfforts,
} from '../actions/segment-actions'
import reportError from '../report-error'
import cacheExpired from '../cache-expired'
import CacheActions from '../actions/cache-actions'
import Alert from '../alert'

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
        if (this.activityResponseOk(response, activityId)) {
          response.json().then((json) => {
            store.dispatch(receiveActivity(activityId, json))
            store.dispatch(CacheActions.set(cacheKey))
          }).catch((error) => {
            reportError(error)
          })
        }
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
          if (this.activityResponseOk(response, activityId)) {
            response.json().then((data) => {
              store.dispatch(receiveStreams(activityId, data))
              store.dispatch(CacheActions.set(cacheKey))
            }).catch((error) => {
              reportError(error)
            })
          }
        }).catch((error) => {
          reportError(error)
        })
    )
  },


  retrieveEffortComparison (activityId, segmentId, segmentEffort1Id, segmentEffort2Id) {
    var cacheKey = `activites[${activityId}].segmentEffort1[${segmentEffort1Id}].segmentEffort2[${segmentEffort2Id}]`
    if (!cacheExpired(cacheKey)) {
      return resolvedPromise()
    }
    return (
      Strava
        .compareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id)
        .then((response) => {
          if (this.activityResponseOk(response, activityId)) {
            response.json()
                    .then((json) => {
                      store.dispatch(receiveCompareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id, json))
                      store.dispatch(CacheActions.set(cacheKey))
                    })
                    .catch((error) => {
                      reportError(error)
                    })
          }
        })
        .catch((error) => {
          reportError(error)
        })
    )
  },

  activityResponseOk (response, activityId) {
    var result = false
    if (response.status === 404) {
      Alert.activity()
      this.removeActivity(activityId)
    } else if (response.status === 401 || response.status === 403) {
      Alert.permissions(() => {
        Strava.reauthorize()
      })
    } else if (!response.ok) {
      Alert.connection()
      reportError(`Strava responded with ${_.get(response, 'status')}: ${_.get(response, 'url')}`)
    } else {
      result = true
    }
    return result
  },

  removeActivity (activityId) {
    store.dispatch(removeActivity(activityId))
  },
}
