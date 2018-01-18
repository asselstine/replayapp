import update from 'immutability-helper'
import { Strava } from '../strava'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RESET':
      if (state.credentials) {
        Strava.deauthorize()
      }
      state = {}
      break
    case 'STRAVA_LOGIN':
      state = update(state, {
        $set: {
          credentials: action.data
        }
      })
      break
    case 'STRAVA_LOGOUT':
      state = update(state, {
        $unset: [
          'credentials'
        ]
      })
      Strava.deauthorize()
      break
  }
  return state
}
