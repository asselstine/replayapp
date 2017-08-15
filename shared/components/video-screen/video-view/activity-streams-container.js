import { ActivityStreams } from './activity-streams'
import { connect } from 'react-redux'
import _ from 'lodash'

export const ActivityStreamsContainer = connect(
  (state, ownProps) => {
    return {
      streams: _.get(state, `activities['${_.get(ownProps, 'activity.id')}'].streams`)
    }
  }
)(ActivityStreams)
