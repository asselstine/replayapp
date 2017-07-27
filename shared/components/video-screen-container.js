import { connect } from 'react-redux'
import _ from 'lodash'
import { VideoScreen } from './video-screen'

export const VideoScreenContainer = connect(
  (state, ownProps) => {
    var activityName = _.get(state, `videos[${ownProps.localIdentifier}].activity.name`)
    if (activityName) {
      ownProps.navigation.setParams({ title: activityName })
    }
    return ownProps
  }
)(VideoScreen)

VideoScreenContainer.navigationOptions = (props) => {
  const { params } = props.navigation.state
  return {
    title: params.title || 'Video'
  }
}
