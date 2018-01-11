import moment from 'moment'
import update from 'react-addons-update'

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
      console.log(`SET CACHE: ${action.key}`)
      state = update(state, cmd)
      break;
  }

  return state
}
