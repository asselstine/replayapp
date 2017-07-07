import { connect } from 'react-redux'
import { SyncModal } from './sync-modal'
import _ from 'lodash'

export const SyncModalContainer = connect(
  (state, ownProps) => {
    var result = {}
    if (ownProps.activity) {
      result['latlngStream'] = _.get(state, `streams['${ownProps.activity.id}'].latlng`)
      result['timeStream'] = _.get(state, `streams['${ownProps.activity.id}'].time`)
    }
    return result
  }
)(SyncModal)
