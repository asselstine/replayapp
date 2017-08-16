import { connect } from 'react-redux'
import { SyncModal } from './sync-modal'
import _ from 'lodash'

export const SyncModalContainer = connect(
  (state, ownProps) => {
    var activityId = _.get(ownProps, 'activity.id')
    var result = {}
    if (ownProps.activity) {
      result['latlngStream'] = _.get(state, `activities['${activityId}'].streams.latlng`)
      result['timeStream'] = _.get(state, `activities['${activityId}'].streams.time`)
    }
    return result
  }
)(SyncModal)
