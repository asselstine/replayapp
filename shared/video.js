import moment from 'moment'
import _ from 'lodash'

export const Video = {
  streamTimeToVideoTime (video, streamTime) {
    var activityStartAt = moment(_.get(video, 'activity.start_date'))
    var videoStartAt = moment(_.get(video, 'startAt'))
    var deltaMs = videoStartAt.diff(activityStartAt)
    var videoTime = streamTime - (deltaMs / 1000.0)
    return videoTime
  },

  videoTimeToStreamTime (video, videoTime) {
    var streamStartAt = _.get(video, 'activity.start_date')
    var videoStartAt = _.get(video, 'startAt')
    if (!streamStartAt || !videoStartAt) { return null }
    var currentVideoTime = moment(videoStartAt).add(videoTime, 's')
    var result = moment(currentVideoTime).diff(moment(streamStartAt)) / 1000.0
    return result
  }
}
