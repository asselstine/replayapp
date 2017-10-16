export const receiveLeaderboard = function (segmentId, leaderboard) {
  return {
    type: 'RECEIVE_LEADERBOARD',
    segmentId: segmentId,
    leaderboard: leaderboard
  }
}

export const receiveCompareEfforts = function (segmentId, segmentEffort1Id, segmentEffort2Id, json) {
  return {
    type: 'RECEIVE_EFFORT_COMPARISON',
    segmentId: segmentId,
    segmentEffort1Id: segmentEffort1Id,
    segmentEffort2Id: segmentEffort2Id,
    comparison: json
  }
}
