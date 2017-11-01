import _ from 'lodash'

import activityProperties from './activity-properties'
import rawVideoDataProperties from './raw-video-data-properties'

export default function (video) {
  var properties = _.pick(video, [
    'startAt'
  ])
  if (video.rawVideoData) {
    properties.rawVideoData = rawVideoDataProperties(video.rawVideoData)
  }
  if (video.activity) {
    properties.activity = activityProperties(video.activity)
  }
  return properties
}
