export const receiveStream = function (activityId, streams) {
  return {
    type: 'RECEIVE_STREAM',
    activityId: activityId,
    streams: streams
  }
}

export const fetchStream = function (activityId) {
  return {
    type: 'FETCH_STREAM',
    activityId: activityId
  }
}
