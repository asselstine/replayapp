import React, {
  Component
} from 'react'
import { connect } from 'react-redux'
import { ActivitySegments } from './activity-segments'
import _ from 'lodash'

export const ActivitySegmentsContainer = connect(
  (state, ownProps) => {
    return {
      segmentEfforts: _.get(state, `activities[${_.get(ownProps, 'activity.id')}].detail.segment_efforts`) || []
    }
  }
)(ActivitySegments)
