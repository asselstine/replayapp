import { Strava } from '../strava'
import { store } from '../store'
import { receiveStream } from '../actions/streams-actions'

export const StreamsService = {
  retrieveStreams (activityId) {
    return (
      Strava
        .retrieveStream(activityId)
        .then((response) => {
          response.json().then((data) => {
            store.dispatch(receiveStream(activityId, data))
          })
        })
    )
  }
}
