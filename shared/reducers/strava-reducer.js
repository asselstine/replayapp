import update from 'react-addons-update'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  switch (action.type) {
    case 'STRAVA_LOGIN':
      state = update(state, {
        $set: {
          credentials: action.data
        }
      })
      break
  }
  return state
}
