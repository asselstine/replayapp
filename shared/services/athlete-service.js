import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveCurrentAthlete,
} from '../actions/athlete-actions'
import reportError from '../report-error'

export const AthleteService = {
  retrieveCurrentAthlete () {
    return (
      Strava.retrieveCurrentAthlete().then((response) => {
        response.json().then((json) => {
          store.dispatch(receiveCurrentAthlete(json))
        }).catch((error) => {
          reportError(error)
        })
      }).catch((error) => {
        reportError(error)
      })
    )
  }
}
