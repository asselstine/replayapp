import moment from 'moment'
import update from 'immutability-helper'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RESET':
    case 'RESET_CACHE':
      state = {}
      break
    case 'SET_CACHE_KEY':
      var cmd = {}
      cmd[action.key] = {
        '$set': moment()
      }
      state = update(state, cmd)
      break;
    case 'RESET_CACHE_MATCH':
      var cmd = {}
      var removals = []
      for (var key in state) {
        if (key.includes(action.keyMatch)) {
          removals.push(key)
        }
      }
      cmd['$unset'] = removals
      state = update(state, cmd)
      break
  }

  return state
}
