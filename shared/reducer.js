import { combineReducers } from 'redux'

import videos from './reducers/videos-reducer'
import strava from './reducers/strava-reducer'
import activities from './reducers/activity-reducer'

export default combineReducers({
  videos,
  strava,
  activities
})
