import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveLeaderboard,
  receiveCompareEfforts
} from '../actions/segment-actions'
import reportError from '../report-error'

export const SegmentService = {
  retrieveLeaderboard (segmentId) {
    return (
      Strava
        .retrieveLeaderboard(segmentId)
        .then((response) => {
          if (Strava.responseOk(response)) {
            response.json()
                    .then((json) => {
                      store.dispatch(receiveLeaderboard(segmentId, json))
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

  retrieveEffortComparison (segmentId, segmentEffort1Id, segmentEffort2Id) {
    return (
      Strava
        .compareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id)
        .then((response) => {
          if (Strava.responseOk(response)) {
            response.json()
                    .then((json) => {
                      store.dispatch(receiveCompareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id, json))
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
  }
}
