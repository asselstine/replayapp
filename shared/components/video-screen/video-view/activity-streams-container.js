import { ActivityStreams } from './activity-streams'
import { connect } from 'react-redux'
import _ from 'lodash'

export const ActivityStreamsContainer = connect(
  (state, ownProps) => {
    // console.log(state, ownProps)
    return {
      streams: _.get(state, `streams['${ownProps.activity.id}']`)
    }
  }
)(ActivityStreams)
