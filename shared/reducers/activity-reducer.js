import update from 'react-addons-update'
import _ from 'lodash'

function initActivity (activityId, state) {
  if (state[activityId]) { return state }
  var cmd = {}
  cmd[activityId] = {
    '$set': {
      streams: {},
      activity: {}
    }
  }
  return update(state, cmd)
}

function updateActivity (state, activityId, cmd) {
  return update(initActivity(activityId, state), cmd)
}

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RECEIVE_ACTIVITY':
      var cmd = {}
      cmd[action.activityId] = {
        detail: {
          '$set': action.activity
        }
      }
      state = updateActivity(state, action.activityId, cmd)
      break
    case 'RECEIVE_SEGMENTS':
      cmd = {}
      cmd[action.activityId] = {
        segments: {
          '$set': _.reduce(action.streams, (hash, stream) => {
            hash[stream.type] = stream
            return hash
          }, {})
        }
      }
      state = updateActivity(state, action.activityId, cmd)
      break
  }
  return state
}
