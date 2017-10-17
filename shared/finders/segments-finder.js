import _ from 'lodash'

export const SegmentsFinder = {
  findDeltaTimes (state, segmentId, segmentEffortId, versusEffortId) {
    var effortKey = `${segmentEffortId} ${versusEffortId}`
    return _.get(state, `segments[${segmentId}].comparisons[${effortKey}].delta_time`)
  },

  findLeaderboardEntries (state, segmentId) {
    return _.get(state, `segments[${segmentId}].leaderboard.entries`, [])
  }
}
