import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveActivity,
  receiveStreams
} from '../actions/activity-actions'

export const ActivityService = {
  retrieveActivity (activityId) {
    return (
      Strava.retrieveActivity(this.props.activity.id).then((response) => {
        response.json().then((json) => {
          store.dispatch(receiveActivity(activityId, json))
        }).catch((error) => {
          console.error(error)
        })
      }).catch((error) => {
        console.error(error)
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
            console.error(error)
          })
        }).catch((error) => {
          console.error(error)
        })
    )
  }
}