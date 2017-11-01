import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveActivity,
  receiveStreams
} from '../actions/activity-actions'
import reportError from '../report-error'

export const ActivityService = {
  retrieveActivity (activityId) {
    return (
      Strava.retrieveActivity(activityId).then((response) => {
        response.json().then((json) => {
          store.dispatch(receiveActivity(activityId, json))
        }).catch((error) => {
          reportError(error)
        })
      }).catch((error) => {
        reportError(error)
      })
    )
  },

  retrieveStreams (activityId) {
    return (
      Strava
        .retrieveStreams(activityId)
        .then((response) => {
          response.json().then((data) => {
            store.dispatch(receiveStreams(activityId, data))
          }).catch((error) => {
            reportError(error)
          })
        }).catch((error) => {
          reportError(error)
        })
    )
  }
}
