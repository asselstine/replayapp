import { connect } from 'react-redux'
import { SyncModal } from './sync-modal'
import _ from 'lodash'

export const SyncModalContainer = connect(
  (state, ownProps) => {
    var result = {}
    if (ownProps.activity) {
      result['latlngStream'] = _.get(state, `activities['${ownProps.activity.id}'].streams.latlng`)
      result['timeStream'] = _.get(state, `activities['${ownProps.activity.id}'].streams.time`)
    }
    return result
  }
)(SyncModal)
