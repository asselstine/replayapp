import { connect } from 'react-redux'
import { LinkedVideos } from './linked-videos'
import { PhotosFramework } from '../../../services/photos-framework'
import _ from 'lodash'

export const LinkedVideosContainer = connect(
  (state, ownProps) => {
    var videos = _.values(state.videos)
    PhotosFramework.checkVideos(videos)
    return {
      videos: _.sortBy(videos, ['creationDateUTCSeconds'])
    }
  }
)(LinkedVideos)
