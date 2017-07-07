import update from 'react-addons-update'
import _ from 'lodash'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RECEIVE_STREAM':
      var cmd = {}
      cmd[action.activityId] = {
        '$set': _.reduce(action.streams, (hash, stream) => {
          hash[stream.type] = stream
          return hash
        }, {})
      }
      state = update(state, cmd)
      break
  }
  return state
}
