import { combineReducers } from 'redux'

import videos from './reducers/videos-reducer'
import strava from './reducers/strava-reducer'
import activities from './reducers/activity-reducer'
import segments from './reducers/segments-reducer'
import athletes from './reducers/athletes-reducer'

export default combineReducers({
  videos,
  strava,
  activities,
  segments,
  athletes
})
