import update from 'react-addons-update'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'ATTACH_ACTIVITY':
      var cmd = {}
      cmd[action.rawVideoData.uri] = {
        '$set': {
          activity: action.activity
        }
      }
      state = update(state, cmd)
      break
    case 'SET_VIDEO_START_AT':
      cmd = {}
      cmd[action.rawVideoData.uri] = {
        startAt: {
          '$set': action.startAt.toDate()
        }
      }
      state = update(state, cmd)
      break
  }
  return state
}
