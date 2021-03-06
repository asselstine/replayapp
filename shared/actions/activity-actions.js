export const receiveActivity = function (activityId, activity) {
  return {
    type: 'RECEIVE_ACTIVITY',
    activityId: activityId,
    activity: activity
  }
}

export const receiveStreams = function (activityId, streams) {
  return {
    type: 'RECEIVE_STREAMS',
    activityId: activityId,
    streams: streams
  }
}

export const removeActivity = function (activityId) {
  return {
    type: 'REMOVE_ACTIVITY',
    activityId: activityId
  }
}
