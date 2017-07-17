import update from 'react-addons-update'
import moment from 'moment'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'NEW_VIDEO':
      if (!state[action.rawVideoData._uri]) {
        var cmd = {}
        cmd[action.rawVideoData._uri] = {
          '$set': {
            rawVideoData: action.rawVideoData,
            startAt: moment(action.rawVideoData.creationDateUTCSeconds * 1000)
          }
        }
        state = update(state, cmd)
      }
      break
    case 'ATTACH_ACTIVITY':
      cmd = {}
      cmd[action.rawVideoData._uri] = {
        activity: {
          '$set': action.activity
        }
      }
      state = update(state, cmd)
      break
    case 'SET_VIDEO_START_AT':
      cmd = {}
      cmd[action.rawVideoData._uri] = {
        startAt: {
          '$set': action.startAt.toDate()
        }
      }
      state = update(state, cmd)
      break
  }
  return state
}
