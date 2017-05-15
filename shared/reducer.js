import { combineReducers } from 'redux'

import videos from './reducers/videos-reducer'
import strava from './reducers/strava-reducer'

export default combineReducers({
  videos,
  strava
})
