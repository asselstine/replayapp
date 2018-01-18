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
      // console.log(`SET CACHE: ${action.key}`)
      state = update(state, cmd)
      break;
    case 'RESET_CACHE_MATCH':
      var cmd = {}
      var remove = []
      for (var key in state) {
        if (key.match(action.keyMatch)) {
          remove.push(key)
        }
      }
      cmd['$unset'] = remove
      state = update(state, cmd)
      break
  }

  return state
}
