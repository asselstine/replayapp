import update from 'react-addons-update'

export default function (state, action) {
  if (typeof state === 'undefined') {
    state = {}
  }
  if (!state[action.segmentId]) {
    state[action.segmentId] = {
      leaderboard: null,
      comparisons: {}
    }
  }
  switch (action.type) {
    case 'RECEIVE_LEADERBOARD':
      var cmd = {}
      cmd[action.segmentId] = {
        leaderboard: {
          '$set': action.leaderboard
        }
      }
      state = update(state, cmd)
      break;
    case 'RECEIVE_EFFORT_COMPARISON':
      cmd = {}
      if (!state[action.segmentId].comparisons) {
        cmd[action.segmentId] = {
          comparisons: {
            '$set': {}
          }
        }
        state = update(state, cmd)
      }
      var effortKey = `${action.segmentEffort1Id} ${action.segmentEffort2Id}`
      var comparisonCmd = {}
      comparisonCmd[effortKey] = { '$set': action.comparison }
      cmd[action.segmentId] = {
        comparisons: comparisonCmd
      }
      state = update(state, cmd)
      break;
  }
  return state
}
