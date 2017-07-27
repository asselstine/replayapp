import update from 'react-addons-update'
import moment from 'moment'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'NEW_VIDEO':
      if (!state[action.rawVideoData.localIdentifier]) {
        var cmd = {}
        cmd[action.rawVideoData.localIdentifier] = {
          '$set': {
            rawVideoData: action.rawVideoData,
            src: action.rawVideoData.video,
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
  }
  return state
}
