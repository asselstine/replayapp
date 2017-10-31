import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveCurrentAthlete,
} from '../actions/athlete-actions'

export const AthleteService = {
  retrieveCurrentAthlete () {
    return (
      Strava.retrieveCurrentAthlete().then((response) => {
        response.json().then((json) => {
          store.dispatch(receiveCurrentAthlete(json))
        }).catch((error) => {
          console.error(error)
        })
      }).catch((error) => {
        console.error(error)
      })
    )
  }
}
