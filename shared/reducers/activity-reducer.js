import update from 'immutability-helper'
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
    case 'RESET':
      state = {}
      break
    case 'RECEIVE_ACTIVITY':
      var cmd = {}
      cmd[action.activityId] = {
        detail: {
          '$set': action.activity
        }
      }
      state = updateActivity(state, action.activityId, cmd)
      break
    case 'RECEIVE_STREAMS':
      cmd = {}
      cmd[action.activityId] = {
        streams: {
          '$set': _.reduce(action.streams, (hash, stream) => {
            hash[stream.type] = stream
            return hash
          }, {})
        }
      }
      state = updateActivity(state, action.activityId, cmd)
      break
    case 'REMOVE_ACTIVITY':
      state = update(state, {
        $unset: [action.activityId]
      })
      break
  }
  return state
}
