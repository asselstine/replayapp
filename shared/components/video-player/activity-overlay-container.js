import { connect } from 'react-redux'
import { ActivityOverlay } from './activity-overlay'
import _ from 'lodash'

export const ActivityOverlayContainer = connect(
  (state, ownProps) => {
    return {
      streams: _.get(state, `activities[${_.get(ownProps, 'activity.id')}].streams`),
      segmentEfforts: _.get(state, `activities[${_.get(ownProps, 'activity.id')}].detail.segment_efforts`) || []
    }
  }
)(ActivityOverlay)
