import { Strava } from '../strava'
import { store } from '../store'
import {
  receiveCurrentAthlete,
} from '../actions/athlete-actions'
import reportError from '../report-error'
import cacheExpired from '../cache-expired'
import CacheActions from '../actions/cache-actions'
import alertResponseError from '../alert-response-error'

export const AthleteService = {
  retrieveCurrentAthlete () {
    var cacheKey = 'athletes.data.dataCachedAt'
    if (!cacheExpired(cacheKey)) {
      return new Promise((resolve, reject) => { resolve() })
    }
    return (
      Strava.retrieveCurrentAthlete().then((response) => {
        if (alertResponseError(response)) { return }
        response.json().then((json) => {
          store.dispatch(receiveCurrentAthlete(json))
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
