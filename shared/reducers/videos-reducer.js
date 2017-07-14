import update from 'react-addons-update'
import moment from 'moment'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'ATTACH_ACTIVITY':
      var cmd = {}
      cmd[action.rawVideoData.video.uri] = {
        '$set': {
          activity: action.activity,
          rawVideoData: action.rawVideoData,
          startAt: moment(action.rawVideoData.creationDateUTCSeconds * 1000)
        }
      }
      state = update(state, cmd)
      break
    case 'SET_VIDEO_START_AT':
      cmd = {}
      cmd[action.rawVideoData.video.uri] = {
        startAt: {
          '$set': action.startAt.toDate()
        }
      }
      state = update(state, cmd)
      break
  }
  return state
}
