import { connect } from 'react-redux'
import { LinkedVideos } from './linked-videos'
import _ from 'lodash'

export const LinkedVideosContainer = connect(
  (state, ownProps) => {
    return {
      videos: _.sortBy(_.values(state.videos), ['creationDateUTCSeconds'])
    }
  }
)(LinkedVideos)
