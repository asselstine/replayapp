export const newVideo = function (rawVideoData) {
  return {
    type: 'NEW_VIDEO',
    rawVideoData: rawVideoData
  }
}

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

export const resetVideoStartAt = function (rawVideoData) {
  return {
    type: 'RESET_VIDEO_START_AT',
    rawVideoData: rawVideoData
  }
}

export const removeVideo = function (video) {
  return {
    type: 'REMOVE_VIDEO',
    video: video
  }
}
