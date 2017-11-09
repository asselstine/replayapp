import update from 'react-addons-update'
import _ from 'lodash'

const INIT = {
  seen: {}
}

export default function (state, action) {
  console.log('CHECK EEEEET ', action)
  if (typeof state === 'undefined') {
    console.log('INITTTT', action)
    state = INIT
  }
  switch (action.type) {
    case 'HELP_SEEN':
      var cmd = { seen: {} }
      cmd.seen[action.key] = {
        '$set': true
      }
      state = update(state, cmd)
      console.log('NEW STATE: ', state)
      break
    case 'HELP_CHECK':
      if (typeof state.seen[action.key] === 'undefined') {
        var cmd = { seen: {} }
        cmd.seen[action.key] = {
          '$set': false
        }
      }
      state = update(state, cmd)
      break
    case 'RESET_HELP':
      console.log('RESETTTT')
      state = INIT
      break
  }
  return state
}
