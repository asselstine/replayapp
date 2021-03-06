import update from 'react-addons-update'
import _ from 'lodash'

const INIT = {
  seen: {}
}

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = INIT
  }
  switch (action.type) {
    case 'HELP_SEEN':
      var cmd = { seen: {} }
      cmd.seen[action.key] = {
        '$set': true
      }
      state = update(state, cmd)
      break
    case 'RESET_HELP':
      state = INIT
      break
  }
  return state
}
