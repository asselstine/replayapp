import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveLeaderboard,
  receiveCompareEfforts
} from '../actions/segment-actions'

export const SegmentService = {
  retrieveLeaderboard (segmentId) {
    return (
      Strava
        .retrieveLeaderboard(segmentId)
        .then((response) => {
          response.json()
                  .then((json) => {
                    store.dispatch(receiveLeaderboard(segmentId, json))
                  })
                  .catch((error) => {
                    console.error(error)
                  })
        })
        .catch((error) => {
          console.error(error)
        })
    )
  },

  retrieveEffortComparison (segmentId, segmentEffort1Id, segmentEffort2Id) {
    return (
      Strava
        .compareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id)
        .then((response) => {
          response.json()
                  .then((json) => {
                    store.dispatch(receiveCompareEfforts(segmentId, segmentEffort1Id, segmentEffort2Id, json))
                  })
                  .catch((error) => {
                    console.error(error)
                  })
        })
        .catch((error) => {
          console.error(error)
        })
    )
  }
}
