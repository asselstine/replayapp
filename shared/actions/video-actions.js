export const attachActivity = function (rawVideoData, activity) {
  return {
    type: 'ATTACH_ACTIVITY',
    rawVideoData: rawVideoData,
    activity: activity
  }
}

export const setVideoStartAt = function (rawVideoData, videoStartAt) {
  return {
    type: 'SET_VIDEO_START_AT',
    rawVideoData: rawVideoData,
    startAt: videoStartAt
  }
}
