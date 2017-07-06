export const attachActivity = function (rawVideoData, activity) {
  return {
    type: 'ATTACH_ACTIVITY',
    rawVideoData: rawVideoData,
    activity: activity
  }
}
