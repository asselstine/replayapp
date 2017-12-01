import update from 'react-addons-update'
import _ from 'lodash'
import uuidv1 from 'uuid/v1'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {
      anonymousId: uuidv1()
    }
  }
  switch (action.type) {
    case 'RESET':
      state = {
        anonymousId: uuidv1()
      }
      break
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
