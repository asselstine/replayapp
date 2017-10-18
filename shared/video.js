import moment from 'moment'
import _ from 'lodash'
import { Activity } from './activity'

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
  },

  startAt (video) {
    return moment(_.get(video, 'startAt'))
  },

  endAt (video) {
    var videoStartAt = this.startAt(video)
    return moment(videoStartAt).add(_.get(video, 'rawVideoData.duration', 0), 's')
  },

  isOutOfSync (video) {
    var activityStartAt = Activity.startAt(video.activity)
    var activityEndAt = Activity.endAt(video.activity)

    var videoStartAt = Video.startAt(video)
    var videoEndAt = Video.endAt(video)

    return videoEndAt.isBefore(activityStartAt) || videoStartAt.isAfter(activityEndAt)
  }
}
