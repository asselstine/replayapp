import update from 'react-addons-update'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  if (action.type === 'ATTACH_ACTIVITY') {
    var cmd = {}
    cmd[action.rawVideoData.uri] = {
      '$set': {
        activity: action.activity
      }
    }
    state = update(state, cmd)
  }
  return state
}
