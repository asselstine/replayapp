import { connect } from 'react-redux'
import { ActivityOverlay } from './activity-overlay'
import _ from 'lodash'

export const ActivityOverlayContainer = connect(
  (state, ownProps) => {
    return {
      streams: _.get(state, `activities[${ownProps.activity.id}].streams`)
    }
  }
)(ActivityOverlay)
