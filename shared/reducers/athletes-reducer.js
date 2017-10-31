import update from 'react-addons-update'
import _ from 'lodash'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RECEIVE_CURRENT_ATHLETE':
      var cmd = {}
      cmd['data'] = {
        '$set': action.data
      }
      state = update(state, cmd)
      break
  }
  return state
}
