import moment from 'moment'

export const videoStreamTimes = function (activity, videoDuration, videoStartAt) {
  var startS = (moment(videoStartAt).valueOf() - moment(activity.start_date).valueOf()) / 1000.0
  var endS = startS + videoDuration

  return {
    startTime: Math.max(0, startS),
    endTime: Math.min(activity.elapsed_time, endS)
  }
}
