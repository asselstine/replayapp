import update from 'immutability-helper'
import moment from 'moment'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'RESET':
      state = {}
      break
    case 'NEW_VIDEO':
      if (!state[action.rawVideoData.localIdentifier]) {
        var cmd = {}
        cmd[action.rawVideoData.localIdentifier] = {
          '$set': {
            rawVideoData: action.rawVideoData,
            videoSource: action.rawVideoData.withOptions({ deliveryMode: 'fast' }).video,
            imageSource: action.rawVideoData.image,
            startAt: moment(action.rawVideoData.creationDateUTCSeconds * 1000)
          }
        }
        state = update(state, cmd)
      }
      break
    case 'ATTACH_ACTIVITY':
      cmd = {}
      cmd[action.rawVideoData.localIdentifier] = {
        activity: {
          '$set': action.activity
        }
      }
      state = update(state, cmd)
      break
    case 'SET_VIDEO_START_AT':
      cmd = {}
      cmd[action.rawVideoData.localIdentifier] = {
        startAt: {
          '$set': action.startAt.toDate()
        }
      }
      state = update(state, cmd)
      break
    case 'REMOVE_VIDEO':
      state = update(state, {})
      delete state[action.video.rawVideoData.localIdentifier]
      break
    case 'RESET_VIDEO_START_AT':
      cmd = {}
      cmd[action.rawVideoData.localIdentifier] = {
        startAt: {
          '$set': moment(action.rawVideoData.creationDateUTCSeconds * 1000)
        }
      }
      state = update(state, cmd)
      break
    case 'REMOVE_ACTIVITY':
      var cmd = {}
      for (var key in state) {
        if (state[key].activity && state[key].activity.id === action.activityId) {
          cmd[key] = {
            $unset: ['activity']
          }
        }
      }
      state = update(state, cmd)
      break
  }
  return state
}
